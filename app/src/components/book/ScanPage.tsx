export interface ScanPageProps {
  bookId: string;
  pageNumber: number;
}

export function ScanPage({ bookId, pageNumber }: ScanPageProps) {
  return (
    <div className="book-scroll-area">
      <div className="manuscript-page scan-mode" data-side="right">
        <img src={`/data/${bookId}/images/${pageNumber}.webp`} alt={`صورة صفحة ${pageNumber}`} loading="lazy" />
      </div>
    </div>
  );
}
