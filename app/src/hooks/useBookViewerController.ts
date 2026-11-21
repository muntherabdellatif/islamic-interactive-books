import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { TajweedDataset } from "../services/tajweedDataService";
import {
  chapterForPageContent,
  chapterOf,
  firstAnnotatedPage,
  getEntity,
  ruleCard,
} from "../services/tajweedSelectors";
import { INITIAL_PANEL_STATE, type PanelState } from "../types/panel";
import { PAGE_QUERY_PARAM, VIEW_MODE_QUERY_PARAM, type ViewMode } from "../types/navigation";
import { useSelection } from "../context/SelectionContext";

export type AnimateDirection = "next" | "prev" | undefined;

export interface BookViewerController {
  pageNumber: number;
  viewMode: ViewMode;
  panelState: PanelState;
  animateDirection: AnimateDirection;
  goToPage: (pageNumber: number, direction?: AnimateDirection) => void;
  goToBookPageOnly: (pageNumber: number) => void;
  setPanelTab: (tab: PanelState["tab"]) => void;
  selectRule: (ruleId: string) => void;
  openMakhraj: (regionIds: string[]) => void;
  showBayt: (baytId: string) => void;
  showChapter: (chapterId: string) => void;
  toggleViewMode: () => void;
}

function clampPage(pageNumber: number, pageCount: number): number {
  return Math.min(pageCount, Math.max(1, pageNumber));
}

function readInitialPage(searchParams: URLSearchParams, pageCount: number): number {
  const raw = Number(searchParams.get(PAGE_QUERY_PARAM));
  return Number.isInteger(raw) && raw >= 1 && raw <= pageCount ? raw : 1;
}

export function useBookViewerController(dataset: TajweedDataset, pageCount: number): BookViewerController {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectEntity } = useSelection();

  const [pageNumber, setPageNumber] = useState(() => readInitialPage(searchParams, pageCount));
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (searchParams.get(VIEW_MODE_QUERY_PARAM) === "scan" ? "scan" : "text"),
  );
  const [panelState, setPanelState] = useState<PanelState>(() => {
    const chapter = chapterForPageContent(dataset, pageNumber);
    return chapter ? { ...INITIAL_PANEL_STATE, chapterId: chapter.id } : INITIAL_PANEL_STATE;
  });
  const [animateDirection, setAnimateDirection] = useState<AnimateDirection>(undefined);

  const updateUrl = useCallback(
    (nextPage: number, nextView: ViewMode) => {
      setSearchParams({ [PAGE_QUERY_PARAM]: String(nextPage), [VIEW_MODE_QUERY_PARAM]: nextView }, { replace: true });
    },
    [setSearchParams],
  );

  const goToBookPageOnly = useCallback(
    (nextPage: number) => {
      const clamped = clampPage(nextPage, pageCount);
      setPageNumber(clamped);
      updateUrl(clamped, viewMode);
    },
    [pageCount, updateUrl, viewMode],
  );

  const goToPage = useCallback(
    (nextPage: number, direction?: AnimateDirection) => {
      const clamped = clampPage(nextPage, pageCount);
      setAnimateDirection(direction);
      setPageNumber(clamped);
      updateUrl(clamped, viewMode);

      const chapter = chapterForPageContent(dataset, clamped);
      setPanelState((previous) => {
        if (chapter && previous.chapterId === chapter.id) return previous;
        return chapter ? { ...INITIAL_PANEL_STATE, chapterId: chapter.id } : INITIAL_PANEL_STATE;
      });
    },
    [dataset, pageCount, updateUrl, viewMode],
  );

  const setPanelTab = useCallback((tab: PanelState["tab"]) => {
    setPanelState((previous) => ({ ...previous, tab }));
  }, []);

  const selectRule = useCallback(
    (ruleId: string) => {
      const rule = getEntity(dataset, ruleId);
      const chapter = chapterOf(dataset, rule);
      const targetPage = rule ? firstAnnotatedPage(dataset, rule) : null;

      setPanelState((previous) => ({
        chapterId: chapter?.id ?? previous.chapterId,
        tab: "rule",
        ruleId,
        focusRegions: null,
      }));

      if (targetPage && targetPage !== pageNumber) {
        goToBookPageOnly(targetPage);
        selectEntity(ruleId);
      }
    },
    [dataset, goToBookPageOnly, pageNumber, selectEntity],
  );

  const openMakhraj = useCallback((regionIds: string[]) => {
    setPanelState((previous) => ({ ...previous, tab: "makhraj", focusRegions: regionIds }));
  }, []);

  const showBayt = useCallback(
    (baytId: string) => {
      const bayt = getEntity(dataset, baytId);
      const targetPage = bayt ? firstAnnotatedPage(dataset, bayt) : null;
      if (targetPage) {
        goToPage(targetPage);
        selectEntity(baytId);
      }
    },
    [dataset, goToPage, selectEntity],
  );

  const showChapter = useCallback(
    (chapterId: string) => {
      const chapter = getEntity(dataset, chapterId);
      const targetAnchor = chapter?.anchors.find((anchor) => anchor.page <= 10);
      if (targetAnchor) goToPage(targetAnchor.page);
    },
    [dataset, goToPage],
  );

  const toggleViewMode = useCallback(() => {
    const next: ViewMode = viewMode === "text" ? "scan" : "text";
    setViewMode(next);
    updateUrl(pageNumber, next);
  }, [pageNumber, updateUrl, viewMode]);

  return useMemo(
    () => ({
      pageNumber,
      viewMode,
      panelState,
      animateDirection,
      goToPage,
      goToBookPageOnly,
      setPanelTab,
      selectRule,
      openMakhraj,
      showBayt,
      showChapter,
      toggleViewMode,
    }),
    [
      pageNumber,
      viewMode,
      panelState,
      animateDirection,
      goToPage,
      goToBookPageOnly,
      setPanelTab,
      selectRule,
      openMakhraj,
      showBayt,
      showChapter,
      toggleViewMode,
    ],
  );
}

export function useRuleCard(dataset: TajweedDataset, ruleId: string | null) {
  return ruleId ? ruleCard(dataset, ruleId) : null;
}
