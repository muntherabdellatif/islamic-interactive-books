import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

export interface PageNavProps {
  pageNumber: number;
  pageCount: number;
  viewMode: "text" | "scan";
  onGoToPage: (pageNumber: number, direction?: "next" | "prev") => void;
  onToggleViewMode: () => void;
  onReturnToIntro?: () => void;
}

export function PageNav({
  pageNumber,
  pageCount,
  viewMode,
  onGoToPage,
  onToggleViewMode,
  onReturnToIntro,
}: PageNavProps) {
  const [draftValue, setDraftValue] = useState(String(pageNumber));

  useEffect(() => {
    setDraftValue(String(pageNumber));
  }, [pageNumber]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setDraftValue(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onGoToPage(Number(draftValue));
  }

  return (
    <div className="book-toolbar" aria-label="تنقّل بين صفحات الكتاب">
      <div className="nav-pager">
        <button
          type="button"
          title="الصفحة السابقة"
          aria-label="السابقة"
          onClick={() => onGoToPage(pageNumber - 1, "next")}
          disabled={pageNumber <= 1}
        >
          ‹
        </button>
        <form onSubmit={handleSubmit}>
          <input type="number" min={1} max={pageCount} value={draftValue} onChange={handleInputChange} aria-label="رقم الصفحة" />
        </form>
        <span className="of">
          / <span>{pageCount}</span>
        </span>
        <button
          type="button"
          title="الصفحة التالية"
          aria-label="التالية"
          onClick={() => onGoToPage(pageNumber + 1, "prev")}
          disabled={pageNumber >= pageCount}
        >
          ›
        </button>
      </div>
      <div className="nav-tools">
        {onReturnToIntro && pageNumber > 12 ? (
          <button
            type="button"
            className="nav-btn-intro"
            title="العودة إلى المقدمة وفهرس المنظومة (صفحة ١٢)"
            onClick={onReturnToIntro}
          >
            📑 المقدمة (١٢)
          </button>
        ) : null}
        <button type="button" className={viewMode === "scan" ? "active" : ""} onClick={onToggleViewMode}>
          {viewMode === "scan" ? "📝 النص المحوَّل" : "📷 الصورة الأصلية"}
        </button>
      </div>
    </div>
  );
}
