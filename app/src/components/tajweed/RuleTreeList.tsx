import type { CSSProperties } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { TajweedRuleEntity } from "../../types/entities";
import { categoryColor } from "../../services/tajweedSelectors";
import { ruleIcon } from "../../utils/ruleIcon";

export interface RuleTreeListProps {
  dataset: TajweedDataset;
  rules: readonly TajweedRuleEntity[];
  onPickRule: (ruleId: string) => void;
}

export function RuleTreeList({ dataset, rules, onPickRule }: RuleTreeListProps) {
  return (
    <div className="rule-tree">
      {rules.map((rule) => (
        <button
          key={rule.id}
          type="button"
          className="rule-tree-item"
          style={{ "--card-color": categoryColor(dataset, rule.metadata.category) } as CSSProperties}
          onClick={() => onPickRule(rule.id)}
        >
          {ruleIcon(rule.id)} <span>{rule.label_ar}</span>
        </button>
      ))}
    </div>
  );
}
