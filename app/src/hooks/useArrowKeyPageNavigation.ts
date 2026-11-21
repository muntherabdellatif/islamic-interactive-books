import { useEffect } from "react";

/** RTL book: ArrowLeft moves to the next page, ArrowRight moves to the previous page. */
export function useArrowKeyPageNavigation(onNext: () => void, onPrevious: () => void): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
      if (event.key === "ArrowLeft") onNext();
      if (event.key === "ArrowRight") onPrevious();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrevious]);
}
