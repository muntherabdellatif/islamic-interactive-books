import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { AboutPage } from "./routes/AboutPage";
import { BookViewerPage } from "./routes/BookViewerPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/books/:bookId" element={<BookViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
