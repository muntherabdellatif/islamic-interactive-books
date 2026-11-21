interface BookPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function BookPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: BookPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis support
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  return (
    <nav className="book-pagination" aria-label="ترقيم صفحات الكتب">
      <div className="book-pagination-info">
        عرض <strong>{startItem}</strong> - <strong>{endItem}</strong> من أصل <strong>{totalItems}</strong> كتاباً
      </div>

      <div className="book-pagination-controls">
        <button
          type="button"
          className="book-pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="الصفحة السابقة"
        >
          <span>السابق</span>
          <span className="pagination-arrow" aria-hidden="true">&rarr;</span>
        </button>

        <div className="book-pagination-pages">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="book-pagination-ellipsis" aria-hidden="true">
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                className={`book-pagination-page-btn ${isActive ? "active" : ""}`}
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`الانتقال إلى الصفحة ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="book-pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="الصفحة التالية"
        >
          <span className="pagination-arrow" aria-hidden="true">&larr;</span>
          <span>التالي</span>
        </button>
      </div>
    </nav>
  );
}
