import type { MobilePaneView } from "../../types/navigation";

export interface MobileViewToggleProps {
  activePane: MobilePaneView;
  onChangePane: (pane: MobilePaneView) => void;
  hasSelectedEntity?: boolean;
}

export function MobileViewToggle({
  activePane,
  onChangePane,
  hasSelectedEntity = false,
}: MobileViewToggleProps) {
  return (
    <div className="mobile-view-toggle" role="tablist" aria-label="تبديل وضع العرض للشاشات الصغيرة">
      <button
        type="button"
        role="tab"
        id="mobile-tab-book"
        aria-selected={activePane === "book"}
        aria-controls="pane-book"
        className={`toggle-btn ${activePane === "book" ? "active" : ""}`}
        onClick={() => onChangePane("book")}
      >
        <span className="toggle-icon" aria-hidden="true">📖</span>
        <span className="toggle-label">نص الكتاب</span>
      </button>

      <button
        type="button"
        role="tab"
        id="mobile-tab-panel"
        aria-selected={activePane === "panel"}
        aria-controls="pane-panel"
        className={`toggle-btn ${activePane === "panel" ? "active" : ""}`}
        onClick={() => onChangePane("panel")}
      >
        <span className="toggle-icon" aria-hidden="true">✨</span>
        <span className="toggle-label">الجزء التفاعلي</span>
        {hasSelectedEntity && <span className="toggle-badge-dot" title="يوجد حكم محدد" />}
      </button>
    </div>
  );
}
