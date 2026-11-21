import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import "./styles/page-style.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/book.css";
import "./styles/panel.css";
import "./styles/panel-extra.css";
import "./styles/makhraj.css";
import "./styles/quiz.css";
import "./styles/home.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
