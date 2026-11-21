import { useParams } from "react-router-dom";
import { getBookById } from "../constants/books";
import { SelectionProvider } from "../context/SelectionContext";
import { AppShell } from "../components/layout/AppShell";
import { TajweedBookViewer } from "../components/tajweed/TajweedBookViewer";

export function BookViewerPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const book = bookId ? getBookById(bookId) : undefined;

  if (!book) {
    return (
      <AppShell>
        <p className="not-found-note">هذا الكتاب غير موجود.</p>
      </AppShell>
    );
  }

  if (book.status === "coming-soon") {
    return (
      <AppShell>
        <p className="coming-soon-note">«{book.titleAr}» قيد التحضير، ولم تبدأ بياناته التفاعلية بعد.</p>
      </AppShell>
    );
  }

  if (book.type !== "tajweed") {
    return (
      <AppShell>
        <p className="coming-soon-note">واجهة هذا النوع من الكتب («{book.titleAr}») لم تُبنَ بعد.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SelectionProvider>
        <TajweedBookViewer book={book} />
      </SelectionProvider>
    </AppShell>
  );
}
