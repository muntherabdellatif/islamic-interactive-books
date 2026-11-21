import { useEffect, useRef, useState } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import {
  getCachedBookPageHtml,
  loadBookPageHtml,
  prefetchAdjacentPages,
} from "../../services/tajweedDataService";
import {
  applyHighlights,
  collapseHeavyFootnotes,
  formatBaytLines,
  highlightSelected as applySelectedHighlight,
} from "../../utils/bookPageDom";
import { useFitFont } from "../../hooks/useFitFont";
import { useSelection } from "../../context/SelectionContext";

export interface HighlightedPageProps {
  bookId: string;
  dataset: TajweedDataset;
  pageNumber: number;
  pageCount: number;
  onSelectEntity: (entityId: string) => void;
}

export function HighlightedPage({
  bookId,
  dataset,
  pageNumber,
  pageCount,
  onSelectEntity,
}: HighlightedPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string | null>(() => getCachedBookPageHtml(bookId, pageNumber) ?? null);
  const { selectedEntityId } = useSelection();

  // Load and cache HTML
  useEffect(() => {
    let cancelled = false;
    const cached = getCachedBookPageHtml(bookId, pageNumber);
    if (cached !== undefined) {
      setHtml(cached);
    } else {
      loadBookPageHtml(bookId, pageNumber)
        .then((pageHtml) => {
          if (!cancelled) setHtml(pageHtml);
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "خطأ غير معروف";
          if (!cancelled) setHtml(`<div class="manuscript-page"><p>تعذّر تحميل الصفحة (${message}).</p></div>`);
        });
    }

    prefetchAdjacentPages(bookId, pageNumber, pageCount);

    return () => {
      cancelled = true;
    };
  }, [bookId, pageNumber, pageCount]);

  // Reset scroll and render page markup
  useEffect(() => {
    const container = containerRef.current;
    if (!container || html === null) return;
    container.scrollTop = 0;
    container.innerHTML = html;
    collapseHeavyFootnotes(container);
    formatBaytLines(container);
    applyHighlights(container, dataset, pageNumber, onSelectEntity);
  }, [html, dataset, pageNumber, onSelectEntity]);

  useFitFont(containerRef, html);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedEntityId) return;
    applySelectedHighlight(container, selectedEntityId);
  }, [selectedEntityId, html]);

  return <div ref={containerRef} className="book-scroll-area" />;
}
