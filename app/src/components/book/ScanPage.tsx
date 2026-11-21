import { useEffect } from "react";
import { preloadBookPageImage } from "../../services/tajweedDataService";

export interface ScanPageProps {
  bookId: string;
  pageNumber: number;
  pageCount: number;
}

export function ScanPage({ bookId, pageNumber, pageCount }: ScanPageProps) {
  useEffect(() => {
    if (pageNumber + 1 <= pageCount) {
      preloadBookPageImage(bookId, pageNumber + 1);
    }
    if (pageNumber - 1 >= 1) {
      preloadBookPageImage(bookId, pageNumber - 1);
    }
  }, [bookId, pageNumber, pageCount]);

  return (
    <div className="book-scroll-area">
      <div className="manuscript-page scan-mode" data-side="right">
        <img
          src={`/data/${bookId}/images/${pageNumber}.webp`}
          alt={`صورة صفحة ${pageNumber}`}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
