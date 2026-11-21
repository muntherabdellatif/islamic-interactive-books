import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { BookCard } from "../components/home/BookCard";
import { BookTypeFilter } from "../components/home/BookTypeFilter";
import { LearningPathCard } from "../components/home/LearningPathCard";
import { BOOK_REGISTRY, BOOK_TYPES, LEARNING_PATHS } from "../constants/books";
import type { BookType } from "../types/book";

export function HomePage() {
  const [activeType, setActiveType] = useState<BookType | null>(null);
  const visibleBooks = activeType ? BOOK_REGISTRY.filter((book) => book.type === activeType) : BOOK_REGISTRY;

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

      <section className="home-section">
        <h2>الكتب</h2>
        <BookTypeFilter types={BOOK_TYPES} activeType={activeType} onSelectType={setActiveType} />
        <div className="book-grid">
          {visibleBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
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
