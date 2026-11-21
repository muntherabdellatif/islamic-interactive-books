import { Link } from "react-router-dom";
import type { BookSummary } from "../../types/book";

export function BookCard({ book }: { book: BookSummary }) {
  const isAvailable = book.status === "available";
  const content = (
    <>
      <div className="book-card-title">{book.titleAr}</div>
      <div className="book-card-author">{book.authorAr}</div>
      <p className="book-card-description">{book.descriptionAr}</p>
      <span className={`book-card-status ${isAvailable ? "status-available" : "status-coming-soon"}`}>
        {isAvailable ? "متاح الآن" : "قريباً"}
      </span>
    </>
  );

  if (!isAvailable) {
    return <div className="book-card book-card-disabled">{content}</div>;
  }
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      {content}
    </Link>
  );
}
