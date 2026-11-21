const ICON_BY_ID_FRAGMENT: ReadonlyArray<[fragment: string, icon: string]> = [
  ["idhar", "👁️"],
  ["idgham", "🔀"],
  ["iqlab", "🔁"],
  ["ikhfa", "🫥"],
  ["ghunnah", "🎵"],
  ["madd", "➰"],
  ["tashabuh", "🧩"],
  ["mathalayn", "🧩"],
  ["tajanus", "🧩"],
  ["lam-al", "🔡"],
  ["lam-fil", "🔡"],
];

const DEFAULT_RULE_ICON = "📘" as const;

/** A simple metaphor icon per rule family, so a child recognizes the kind of rule at a glance. */
export function ruleIcon(ruleId: string): string {
  const match = ICON_BY_ID_FRAGMENT.find(([fragment]) => ruleId.includes(fragment));
  return match ? match[1] : DEFAULT_RULE_ICON;
}
