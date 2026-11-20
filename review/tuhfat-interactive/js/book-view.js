/**
 * Left pane: renders the approved stage-1 HTML for the current page and highlights
 * entities over it. Highlight/anchor-resolution logic ported from review/entities.html.
 */
const BookView = (() => {
  const container = document.getElementById("book-pane");
  let scanMode = false;

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function highlightQuote(lineEl, quote, occurrence, entity, color) {
    const walker = document.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT);
    let seen = 0;
    let node;
    while ((node = walker.nextNode())) {
      const idx = node.textContent.indexOf(quote);
      if (idx === -1) continue;
      seen += 1;
      if (seen !== (occurrence || 1)) continue;
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + quote.length);
      const mark = document.createElement("span");
      mark.className = `ent ent-${entity.type}`;
      mark.style.setProperty("--rule-color", color);
      mark.style.background = `color-mix(in srgb, ${color} 22%, transparent)`;
      mark.dataset.entityId = entity.id;
      range.surroundContents(mark);
      return;
    }
  }

  function colorFor(entity) {
    if (entity.type === "tajweed_rule" && entity.metadata && entity.metadata.category) {
      return Data.categoryColor(entity.metadata.category);
    }
    return "#10b981";
  }

  function applyHighlights(pageNum) {
    for (const e of Data.onPage(pageNum)) {
      const color = colorFor(e);
      for (const a of e.anchors.filter((x) => x.page === pageNum)) {
        const block = container.querySelector(`[data-block-id="${a.block_id}"]`);
        if (!block) continue;
        let target = block;
        if (a.line) target = block.querySelector(`.line[data-line="${a.line}"]`) || block;
        if (a.quote) {
          highlightQuote(target, a.quote, a.occurrence, e, color);
        } else if (e.type === "bayt" || e.type === "chapter") {
          target.classList.add("ent", `ent-${e.type}`);
          target.dataset.entityId = e.id;
          target.style.setProperty("--rule-color", color);
        }
        if (e.needs_review) target.classList.add("needs-review");
      }
    }
    container.querySelectorAll(".ent").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        Sync.select(el.dataset.entityId, { fromBook: true });
      });
    });
  }

  function clearSelection() {
    container.querySelectorAll(".ent.selected").forEach((el) => el.classList.remove("selected"));
  }

  // Heavy/technical footnotes (e.g. page 2's note on "الكمال", which carries real content but
  // in dense scholarly-apparatus prose) are collapsed by default in this reading view, so a
  // child isn't confronted with them; anyone can still open one with a tap. This only touches
  // the rendered DOM, never data/books/*/html/*.html itself.
  const HEAVY_FOOTNOTE_LINE_THRESHOLD = 3;

  function collapseHeavyFootnotes() {
    container.querySelectorAll(".footnote").forEach((fn) => {
      const lines = fn.querySelectorAll(":scope > .line");
      if (lines.length <= HEAVY_FOOTNOTE_LINE_THRESHOLD) return;
      const details = document.createElement("details");
      details.className = "footnote-details";
      const summary = document.createElement("summary");
      summary.textContent = "عرض التفاصيل العلمية";
      details.appendChild(summary);
      lines.forEach((line) => details.appendChild(line));
      fn.appendChild(details);
    });
  }

  // A bayt line's printed source is "٦) <shatr-1/><shatr-2/>" — the number is a bare text
  // node, not an element, so CSS alone can't style it or lay the line out as three fixed
  // grid columns (number, shatr 1, shatr 2). Wrapped once per render (view-layer only,
  // data/books/*/html/*.html itself is never touched).
  function formatBaytLines() {
    container.querySelectorAll(".poem-bayt .line").forEach((line) => {
      const shatr1 = line.querySelector(".shatr-1");
      const shatr2 = line.querySelector(".shatr-2");
      if (!shatr1 || !shatr2) return;
      const numberNode = line.firstChild;
      const numberText = numberNode && numberNode.nodeType === Node.TEXT_NODE ? numberNode.textContent.trim() : "";
      const badge = document.createElement("span");
      badge.className = "bayt-number";
      badge.textContent = numberText.replace(/[)）]+\s*$/, "");
      // A footnote-reference digit embedded mid-verse (e.g. "أَرْبَعُ(٢) أَحْكَامٍ") is plain
      // text, not a separate element, in the source; wrap it as a light superscript instead
      // of letting it render at full verse size. Safe to do via innerHTML here: a shatr's
      // content is always plain transcribed text, never markup.
      [shatr1, shatr2].forEach((shatr) => {
        shatr.innerHTML = shatr.innerHTML.replace(/\(([٠-٩]+)\)/g, '<span class="footnote-ref">($1)</span>');
      });
      line.replaceChildren(badge, shatr1, shatr2);
    });
  }

  function highlightSelected(id) {
    clearSelection();
    const nodes = container.querySelectorAll(`[data-entity-id="${id}"]`);
    nodes.forEach((el) => {
      el.classList.add("selected");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function render(pageNum, { animateDirection } = {}) {
    const old = container.querySelector(".manuscript-page");
    if (old && animateDirection) old.classList.add("flip-out");

    let html;
    if (scanMode) {
      html = `<div class="manuscript-page scan-mode" data-side="right">
        <img src="${BOOK_DIR}/images/${pageNum}.webp" alt="صورة صفحة ${pageNum}" loading="lazy">
      </div>`;
    } else {
      try {
        const res = await fetch(`${BOOK_DIR}/html/${pageNum}.html`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        html = await res.text();
      } catch (err) {
        html = `<div class="manuscript-page"><p>تعذّر تحميل الصفحة (${err.message}).</p></div>`;
      }
    }

    setTimeout(() => {
      container.innerHTML = html;
      if (!scanMode) {
        collapseHeavyFootnotes();
        formatBaytLines();
        refit();
        applyHighlights(pageNum);
        // Amiri loads async; a fallback-font measurement can under/overshoot, so refit once it's in.
        document.fonts.ready.then(refit);
      }
    }, old && animateDirection ? 120 : 0);
  }

  const MAX_FONT_PX = 24;
  const BASE_FONT_PX = 20;
  // Size the font so the widest natural line just fills the pane, as in the print
  // (same technique as review/index.html's fitFont, reusing page-style.css's .measure mode).
  function fitFont() {
    const page = container.querySelector(".manuscript-page");
    if (!page) return;
    container.style.fontSize = `${BASE_FONT_PX}px`;
    // Available width is the page card's own content box (it caps at 640px and has its own
    // padding), not the scroll container's — measuring against the container overflows pages
    // whose content box is narrower than the container, like the title page.
    const pageStyle = getComputedStyle(page);
    const avail = page.clientWidth - parseFloat(pageStyle.paddingInlineStart) - parseFloat(pageStyle.paddingInlineEnd);
    page.classList.add("measure");
    let widest = 0;
    page.querySelectorAll(".page-body .line").forEach((l) => {
      // A bayt line's shatrs are grid columns stretched (justified) to fill whatever width
      // they're given — they have no "natural" width of their own to contribute here, and
      // including them risks measuring a narrower .measure-mode layout than the real grid
      // layout actually renders, which would then under-shrink (overflow) every other line
      // on the page once the real font-size is applied.
      if (l.closest(".poem-bayt")) return;
      widest = Math.max(widest, l.getBoundingClientRect().width);
    });
    page.classList.remove("measure");
    if (widest > 0) container.style.fontSize = `${Math.min(MAX_FONT_PX, (BASE_FONT_PX * avail) / widest)}px`;
  }

  // Giving every bayt's shatr-1/shatr-2 an identical 50/50 split (the first version of this
  // fix) forces short phrases to stretch across half the page width, dumping all the extra
  // space into one or two word-gaps — exactly the "ugly big gaps" the reader flagged. Real
  // printed verse columns are only as wide as the longest line actually needs: measure each
  // shatr's own natural (unstretched) width once the page's final font-size is set, take the
  // page's own widest shatr-1 and widest shatr-2, and size the grid columns to those — so
  // every bayt still starts/ends at the same x position (this page's shared column width),
  // but only the page's single longest line in each half needs zero stretch, and every
  // other line needs only as much as its own shortfall against that page's longest line,
  // not against the full line width.
  function alignBaytColumns() {
    const page = container.querySelector(".manuscript-page");
    if (!page) return;
    const rows = [...page.querySelectorAll(".poem-bayt .line")]
      .map((line) => ({ shatr1: line.querySelector(".shatr-1"), shatr2: line.querySelector(".shatr-2") }))
      .filter((r) => r.shatr1 && r.shatr2);
    if (!rows.length) return;
    page.classList.add("measure"); // collapses the grid to shrink-to-fit so each shatr reports its own content width
    let max1 = 0, max2 = 0;
    rows.forEach(({ shatr1, shatr2 }) => {
      max1 = Math.max(max1, shatr1.getBoundingClientRect().width);
      max2 = Math.max(max2, shatr2.getBoundingClientRect().width);
    });
    page.classList.remove("measure");
    const fontPx = parseFloat(getComputedStyle(page).fontSize) || 16;
    page.style.setProperty("--shatr1-col", `${(max1 / fontPx).toFixed(3)}em`);
    page.style.setProperty("--shatr2-col", `${(max2 / fontPx).toFixed(3)}em`);
  }

  // A prose line that happens to be short (the last sentence of a footnote's point before a
  // new one starts, not necessarily the block's own :last-child) still inherits the page's
  // default text-align-last: justify, and a short sentence stretched across the full page
  // width is the same "ugly big gaps" problem as the bayt columns above. Detect this from
  // actual rendered width rather than DOM position: if a line's own natural width falls well
  // short of the page's text width, right-align it instead of stretching it.
  const SHORT_LINE_RATIO = 0.92;
  function markShortLines() {
    const page = container.querySelector(".manuscript-page");
    if (!page) return;
    const pageStyle = getComputedStyle(page);
    const avail = page.clientWidth - parseFloat(pageStyle.paddingInlineStart) - parseFloat(pageStyle.paddingInlineEnd);
    if (avail <= 0) return;
    page.classList.add("measure");
    page.querySelectorAll(".book-paragraph .line, .sanad-block .line, .footnote .line").forEach((l) => {
      const w = l.getBoundingClientRect().width;
      l.classList.toggle("short-line", w < avail * SHORT_LINE_RATIO);
    });
    page.classList.remove("measure");
  }

  function refit() {
    fitFont();
    alignBaytColumns();
    markShortLines();
  }

  window.addEventListener("resize", refit);

  function toggleScanMode(forceValue) {
    scanMode = typeof forceValue === "boolean" ? forceValue : !scanMode;
    return scanMode;
  }

  return { render, highlightSelected, clearSelection, toggleScanMode, get scanMode() { return scanMode; } };
})();
