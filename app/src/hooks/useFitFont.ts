import { useEffect, type RefObject } from "react";
import { refitBookPage } from "../utils/bookPageDom";

/** Re-measures font size and column alignment after content changes, and again on resize. */
export function useFitFont(containerRef: RefObject<HTMLElement | null>, dependencyKey: unknown): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    refitBookPage(container);
    void document.fonts.ready.then(() => refitBookPage(container));

    // ResizeObserver, not a window "resize" listener: the pane's own width can change
    // (split-ratio drag, device rotation) without the window itself resizing.
    const observer = new ResizeObserver(() => refitBookPage(container));
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);
}
