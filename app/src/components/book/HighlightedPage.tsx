import { useEffect, useRef, useState } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import { loadBookPageHtml } from "../../services/tajweedDataService";
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
  onSelectEntity: (entityId: string) => void;
}

export function HighlightedPage({ bookId, dataset, pageNumber, onSelectEntity }: HighlightedPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string | null>(null);
  const { selectedEntityId } = useSelection();

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    loadBookPageHtml(bookId, pageNumber)
      .then((pageHtml) => {
        if (!cancelled) setHtml(pageHtml);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "خطأ غير معروف";
        if (!cancelled) setHtml(`<div class="manuscript-page"><p>تعذّر تحميل الصفحة (${message}).</p></div>`);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, pageNumber]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || html === null) return;
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
