import type { BookSummary } from "../../types/book";
import type { TajweedDataset } from "../../services/tajweedDataService";
import { useTajweedBookData } from "../../hooks/useTajweedBookData";
import { useBookViewerController } from "../../hooks/useBookViewerController";
import { BookArea } from "../book/BookArea";
import { TajweedInteractivePanel } from "./TajweedInteractivePanel";

export interface TajweedBookViewerProps {
  book: BookSummary;
}

function TajweedBookViewerReady({ book, dataset }: TajweedBookViewerProps & { dataset: TajweedDataset }) {
  const controller = useBookViewerController(dataset, book.pageCount);
  return (
    <div className="split-workspace" dir="ltr">
      <BookArea bookId={book.id} pageCount={book.pageCount} dataset={dataset} controller={controller} />
      <TajweedInteractivePanel dataset={dataset} pageNumber={controller.pageNumber} controller={controller} />
    </div>
  );
}

export function TajweedBookViewer({ book }: TajweedBookViewerProps) {
  const state = useTajweedBookData(book.id);

  if (state.status === "loading") {
    return <p className="loading-note">تحميل بيانات الكتاب...</p>;
  }
  if (state.status === "error") {
    return <p className="error-note">{state.message}</p>;
  }

  return <TajweedBookViewerReady book={book} dataset={state.dataset} />;
}
