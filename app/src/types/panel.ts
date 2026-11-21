export type PanelTab = "overview" | "rule" | "makhraj";

export interface PanelState {
  chapterId: string | null;
  tab: PanelTab;
  ruleId: string | null;
  focusRegions: string[] | null;
}

export const INITIAL_PANEL_STATE: PanelState = {
  chapterId: null,
  tab: "overview",
  ruleId: null,
  focusRegions: null,
};
