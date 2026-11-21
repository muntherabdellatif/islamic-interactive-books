import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches render-time crashes anywhere below it so the user sees an apology
 *  instead of a blank page — the previous behavior on any uncaught error. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error in the app tree:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="app-crash-note" role="alert">
          <p>حدث خطأ غير متوقع أثناء عرض هذه الصفحة.</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
