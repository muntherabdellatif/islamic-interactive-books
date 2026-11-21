import { useCallback } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { BookViewerController } from "../../hooks/useBookViewerController";
import { useArrowKeyPageNavigation } from "../../hooks/useArrowKeyPageNavigation";
import { useSelection } from "../../context/SelectionContext";
import { PageNav } from "./PageNav";
import { ScanPage } from "./ScanPage";
import { HighlightedPage } from "./HighlightedPage";

export interface BookAreaProps {
  bookId: string;
  pageCount: number;
  dataset: TajweedDataset;
  controller: BookViewerController;
}

export function BookArea({ bookId, pageCount, dataset, controller }: BookAreaProps) {
  const { pageNumber, viewMode, goToPage, toggleViewMode } = controller;
  const { selectEntity } = useSelection();

  const handleNextPage = useCallback(() => goToPage(pageNumber + 1, "prev"), [goToPage, pageNumber]);
  const handlePrevPage = useCallback(() => goToPage(pageNumber - 1, "next"), [goToPage, pageNumber]);

  useArrowKeyPageNavigation(handleNextPage, handlePrevPage);

  return (
    <section className="pane pane-book" dir="rtl" aria-label="نص الكتاب" id="pane-book">
      <PageNav
        pageNumber={pageNumber}
        pageCount={pageCount}
        viewMode={viewMode}
        onGoToPage={goToPage}
        onToggleViewMode={toggleViewMode}
        onReturnToIntro={controller.returnToIntro}
      />
      {viewMode === "scan" ? (
        <ScanPage bookId={bookId} pageNumber={pageNumber} pageCount={pageCount} />
      ) : (
        <HighlightedPage
          bookId={bookId}
          dataset={dataset}
          pageNumber={pageNumber}
          pageCount={pageCount}
          onSelectEntity={selectEntity}
        />
      )}
    </section>
  );
}
