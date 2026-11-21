import { useEffect, type RefObject } from "react";
import { refitBookPage } from "../utils/bookPageDom";

/** Re-measures font size and column alignment after content changes, and again on resize. */
export function useFitFont(containerRef: RefObject<HTMLElement | null>, dependencyKey: unknown): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    refitBookPage(container);
    void document.fonts.ready.then(() => refitBookPage(container));

    const handleResize = (): void => refitBookPage(container);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);
}
