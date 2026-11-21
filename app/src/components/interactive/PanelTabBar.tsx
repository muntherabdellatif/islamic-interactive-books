import type { CSSProperties } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { TajweedRuleEntity } from "../../types/entities";
import type { PanelTab } from "../../types/panel";
import { categoryColor } from "../../services/tajweedSelectors";
import { ruleIcon } from "../../utils/ruleIcon";

export interface PanelTabBarProps {
  dataset: TajweedDataset;
  leafRules: readonly TajweedRuleEntity[];
  activeTab: PanelTab;
  activeRuleId: string | null;
  onSelectOverview: () => void;
  onSelectRule: (ruleId: string) => void;
  onSelectMakhraj: () => void;
  onReturnToIntro?: () => void;
  showReturnToIntro?: boolean;
}

export function PanelTabBar({
  dataset,
  leafRules,
  activeTab,
  activeRuleId,
  onSelectOverview,
  onSelectRule,
  onSelectMakhraj,
  onReturnToIntro,
  showReturnToIntro,
}: PanelTabBarProps) {
  return (
    <div className="panel-tabs">
      {showReturnToIntro && onReturnToIntro ? (
        <button
          type="button"
          className="panel-tab panel-tab-intro"
          title="العودة إلى المقدمة وفهرس المنظومة (صفحة ١٢)"
          onClick={onReturnToIntro}
        >
          📑 المقدمة (١٢)
        </button>
      ) : null}
      <button type="button" className={`panel-tab ${activeTab === "overview" ? "active" : ""}`} onClick={onSelectOverview}>
        🗂️ نظرة عامة
      </button>
      {leafRules.map((rule) => (
        <button
          key={rule.id}
          type="button"
          className={`panel-tab ${activeTab === "rule" && activeRuleId === rule.id ? "active" : ""}`}
          style={{ "--tab-color": categoryColor(dataset, rule.metadata.category) } as CSSProperties}
          onClick={() => onSelectRule(rule.id)}
        >
          {ruleIcon(rule.id)} {rule.label_ar}
        </button>
      ))}
      <button type="button" className={`panel-tab ${activeTab === "makhraj" ? "active" : ""}`} onClick={onSelectMakhraj}>
        🗺️ مخارج الحروف
      </button>
    </div>
  );
}
