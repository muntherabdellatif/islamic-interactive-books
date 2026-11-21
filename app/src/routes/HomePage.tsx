import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { BookCard } from "../components/home/BookCard";
import { BookTypeFilter } from "../components/home/BookTypeFilter";
import { BookPagination } from "../components/home/BookPagination";
import { LearningPathCard } from "../components/home/LearningPathCard";
import { BOOK_REGISTRY, BOOK_TYPES, LEARNING_PATHS, BOOKS_PER_PAGE } from "../constants/books";
import type { BookType } from "../types/book";

export function HomePage() {
  const [activeType, setActiveType] = useState<BookType | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const visibleBooks = activeType ? BOOK_REGISTRY.filter((book) => book.type === activeType) : BOOK_REGISTRY;
  const totalPages = Math.ceil(visibleBooks.length / BOOKS_PER_PAGE);
  const paginatedBooks = visibleBooks.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE,
  );

  const handleSelectType = (type: BookType | null) => {
    setActiveType(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const booksSection = document.getElementById("books-section");
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AppShell>
      <div className="page-content">
      <section className="home-hero">
        <h1>منصة التراث الإسلامي التفاعلي</h1>
        <p>
          إخراج التراث الإسلامي وكتب العلوم الشرعية من قوالب النصوص الجافة إلى تجارب تفاعلية بصرية تسهّل الفهم
          والبحث على طلبة العلم وعامة الجمهور.
        </p>
      </section>

      <section className="home-section" id="books-section">
        <h2>الكتب</h2>
        <BookTypeFilter types={BOOK_TYPES} activeType={activeType} onSelectType={handleSelectType} />
        <div className="book-grid">
          {paginatedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
        <BookPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={visibleBooks.length}
          pageSize={BOOKS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </section>

      <section className="home-section">
        <h2>مسارات التعلّم</h2>
        <div className="learning-path-grid">
          {LEARNING_PATHS.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>
      </div>
    </AppShell>
  );
}
