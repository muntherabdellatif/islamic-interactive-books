import type { BookEntity } from "../types/entities";
import type { TajweedDataset } from "../services/tajweedDataService";
import { categoryColor, entitiesOnPage } from "../services/tajweedSelectors";
import {
  BOOK_FONT_BASE_PX,
  BOOK_FONT_MAX_PX,
  BOOK_FONT_MIN_PX,
  BOOK_FONT_SAFETY_RATIO,
  DEFAULT_CARD_COLOR,
} from "../constants/ui";

const HEAVY_FOOTNOTE_LINE_THRESHOLD = 3;
const SHORT_LINE_RATIO = 0.92;
/* A bayt row's grid (see page-style.css) reserves 2.4em for the number badge plus
   3 × 0.5em of column-gap around its tracks — fixed overhead on top of the two
   shatr widths, needed whether the row is laid out side-by-side or stacked. */
const BAYT_SIDE_BY_SIDE_OVERHEAD_EM = 5.6;
const BAYT_STACKED_OVERHEAD_EM = 2.9;

function colorForEntity(dataset: TajweedDataset, entity: BookEntity): string {
  const category = (entity.metadata as { category?: string }).category;
  if (entity.type === "tajweed_rule" && category) return categoryColor(dataset, category);
  return DEFAULT_CARD_COLOR;
}

function highlightQuote(
  lineEl: Element,
  quote: string,
  occurrence: number | undefined,
  entity: BookEntity,
  color: string,
): void {
  const walker = document.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT);
  let seen = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const idx = text.indexOf(quote);
    if (idx === -1) continue;
    seen += 1;
    if (seen !== (occurrence ?? 1)) continue;
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

/** Highlights every entity anchored on this page inside the just-rendered page markup. */
export function applyHighlights(
  container: HTMLElement,
  dataset: TajweedDataset,
  pageNumber: number,
  onSelectEntity: (entityId: string) => void,
): void {
  for (const entity of entitiesOnPage(dataset, pageNumber)) {
    const color = colorForEntity(dataset, entity);
    for (const anchor of entity.anchors.filter((a) => a.page === pageNumber)) {
      const block = container.querySelector(`[data-block-id="${anchor.block_id}"]`);
      if (!block) continue;
      const target = anchor.line
        ? (block.querySelector(`.line[data-line="${anchor.line}"]`) ?? block)
        : block;
      if (anchor.quote) {
        highlightQuote(target, anchor.quote, undefined, entity, color);
      } else if (entity.type === "bayt" || entity.type === "chapter") {
        target.classList.add("ent", `ent-${entity.type}`);
        (target as HTMLElement).dataset.entityId = entity.id;
        (target as HTMLElement).style.setProperty("--rule-color", color);
      }
    }
  }
  container.querySelectorAll<HTMLElement>(".ent").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      const entityId = el.dataset.entityId;
      if (entityId) onSelectEntity(entityId);
    });
  });
}

export function clearSelection(container: HTMLElement): void {
  container.querySelectorAll(".ent.selected").forEach((el) => el.classList.remove("selected"));
}

export function highlightSelected(container: HTMLElement, entityId: string): void {
  clearSelection(container);
  container.querySelectorAll<HTMLElement>(`[data-entity-id="${entityId}"]`).forEach((el) => {
    el.classList.add("selected");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/** Heavy footnotes are collapsed behind a <details> toggle so they don't overwhelm a young reader. */
export function collapseHeavyFootnotes(container: HTMLElement): void {
  container.querySelectorAll(".footnote").forEach((footnote) => {
    const lines = footnote.querySelectorAll(":scope > .line");
    if (lines.length <= HEAVY_FOOTNOTE_LINE_THRESHOLD) return;
    const details = document.createElement("details");
    details.className = "footnote-details";
    const summary = document.createElement("summary");
    summary.textContent = "عرض التفاصيل العلمية";
    details.appendChild(summary);
    lines.forEach((line) => details.appendChild(line));
    footnote.appendChild(details);
  });
}

/** Marks standalone basmalah lines so they can be centered cleanly. */
export function formatBasmalah(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>(".book-paragraph").forEach((p) => {
    const text = (p.textContent ?? "").replace(/\([٠-٩0-9]+\)/g, "").trim();
    if (text.startsWith("بِسْمِ") && text.includes("الرَّحِيمِ")) {
      p.classList.add("basmalah");
    }
  });
}

/** A bayt line's printed "٦) <shatr1/><shatr2/>" is reshaped into a number badge + two columns. */
export function formatBaytLines(container: HTMLElement): void {
  container.querySelectorAll(".poem-bayt .line").forEach((line) => {
    const shatr1 = line.querySelector<HTMLElement>(".shatr-1");
    const shatr2 = line.querySelector<HTMLElement>(".shatr-2");
    if (!shatr1 || !shatr2) return;

    let badgeNum = "";
    const numberNode = line.firstChild;
    const rawNumber =
      numberNode && numberNode.nodeType === Node.TEXT_NODE ? (numberNode.textContent ?? "").trim() : "";
    const digitMatch = rawNumber.match(/[٠-٩0-9]+/);

    if (digitMatch) {
      badgeNum = digitMatch[0];
      if (rawNumber.endsWith("(") && !shatr1.textContent?.trim().startsWith("(")) {
        shatr1.textContent = "(" + (shatr1.textContent ?? "");
      }
    }

    // Check if verse number is inside shatr-1 (e.g. pages 12-15: "١) ...")
    const shatrMatch = shatr1.innerHTML.match(/^\s*([٠-٩0-9]+)\s*\)\s*/);
    if (shatrMatch) {
      if (!badgeNum) {
        badgeNum = shatrMatch[1];
      }
      shatr1.innerHTML = shatr1.innerHTML.replace(/^\s*[٠-٩0-9]+\s*\)\s*/, "");
    }

    const badge = document.createElement("span");
    badge.className = "bayt-number";
    badge.textContent = badgeNum;

    for (const shatr of [shatr1, shatr2]) {
      shatr.innerHTML = shatr.innerHTML.replace(/\(([٠-٩]+)\)/g, '<span class="footnote-ref">($1)</span>');
    }
    line.replaceChildren(badge, shatr1, shatr2);
  });
}

/**
 * Recomputes font size, column alignments, and short-line markers in a single
 * layout-measurement pass to avoid layout thrashing and stutter during page navigation.
 */
export function refitBookPage(container: HTMLElement): void {
  const page = container.querySelector<HTMLElement>(".manuscript-page");
  if (!page) return;

  container.style.fontSize = `${BOOK_FONT_BASE_PX}px`;
  page.classList.remove("stack-bayt");
  const pageStyle = getComputedStyle(page);
  const avail =
    page.clientWidth - parseFloat(pageStyle.paddingInlineStart) - parseFloat(pageStyle.paddingInlineEnd);
  if (avail <= 0) return;

  const safeAvail = avail * BOOK_FONT_SAFETY_RATIO;

  // Single measurement pass with .measure enabled
  page.classList.add("measure");

  let widestBody = 0;
  // Measure body prose lines (excluding poem bayts and excluding footnotes which wrap naturally)
  page.querySelectorAll<HTMLElement>(".page-body .line").forEach((line) => {
    if (line.closest(".poem-bayt")) return;
    widestBody = Math.max(widestBody, line.getBoundingClientRect().width);
  });

  let widestShatr = 0;

  const baytRows = [...page.querySelectorAll(".poem-bayt .line")]
    .map((line) => ({
      shatr1: line.querySelector<HTMLElement>(".shatr-1"),
      shatr2: line.querySelector<HTMLElement>(".shatr-2"),
    }))
    .filter((row): row is { shatr1: HTMLElement; shatr2: HTMLElement } => Boolean(row.shatr1 && row.shatr2));

  baytRows.forEach(({ shatr1, shatr2 }) => {
    const w1 = shatr1.getBoundingClientRect().width;
    const w2 = shatr2.getBoundingClientRect().width;
    widestShatr = Math.max(widestShatr, w1, w2);
  });

  // Both shatrs are sized identically, so width needed is 2 * widestShatr + overhead
  const widestBaytSideBySide =
    baytRows.length > 0 ? 2 * widestShatr + BAYT_SIDE_BY_SIDE_OVERHEAD_EM * BOOK_FONT_BASE_PX : 0;

  const shortLineCandidates = [
    ...page.querySelectorAll<HTMLElement>(".book-paragraph:not(.basmalah) .line, .sanad-block .line"),
  ].map((line) => ({ line, width: line.getBoundingClientRect().width }));

  page.classList.remove("measure");

  // Determine maximum font cap based on available width:
  // On screens <= 1024px or narrower panes, cap font size so text never appears oversized or spills
  const maxFontForWidth = avail < 480 ? 17 : (avail < 620 ? 19 : BOOK_FONT_MAX_PX);

  // Sizing font based on poetry grid and body text (footnotes wrap naturally)
  const primaryWidest = Math.max(widestBody, widestBaytSideBySide);
  const sideBySideFontPx =
    primaryWidest > 0 ? (BOOK_FONT_BASE_PX * safeAvail) / primaryWidest : maxFontForWidth;

  let finalFontPx = Math.min(maxFontForWidth, sideBySideFontPx);

  // ONLY stack bayt if width is truly too narrow to fit side-by-side even at minimum font size
  if (sideBySideFontPx < BOOK_FONT_MIN_PX && widestShatr > 0) {
    page.classList.add("stack-bayt");
    const stackedWidest = Math.max(widestBody, widestShatr + BAYT_STACKED_OVERHEAD_EM * BOOK_FONT_BASE_PX);
    const stackedFontPx =
      stackedWidest > 0 ? (BOOK_FONT_BASE_PX * safeAvail) / stackedWidest : maxFontForWidth;
    finalFontPx = Math.min(maxFontForWidth, Math.max(BOOK_FONT_MIN_PX - 2, stackedFontPx));
  }

  container.style.fontSize = `${finalFontPx}px`;

  // Mark short lines
  const scale = finalFontPx / BOOK_FONT_BASE_PX;
  shortLineCandidates.forEach(({ line, width }) => {
    line.classList.toggle("short-line", width * scale < avail * SHORT_LINE_RATIO);
  });
}
