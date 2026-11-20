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
        fitFont();
        applyHighlights(pageNum);
        // Amiri loads async; a fallback-font measurement can under/overshoot, so refit once it's in.
        document.fonts.ready.then(fitFont);
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
      widest = Math.max(widest, l.getBoundingClientRect().width);
    });
    page.classList.remove("measure");
    if (widest > 0) container.style.fontSize = `${Math.min(MAX_FONT_PX, (BASE_FONT_PX * avail) / widest)}px`;
  }

  window.addEventListener("resize", fitFont);

  function toggleScanMode(forceValue) {
    scanMode = typeof forceValue === "boolean" ? forceValue : !scanMode;
    return scanMode;
  }

  return { render, highlightSelected, clearSelection, toggleScanMode, get scanMode() { return scanMode; } };
})();
