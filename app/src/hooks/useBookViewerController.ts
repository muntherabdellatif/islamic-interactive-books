import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { TajweedDataset } from "../services/tajweedDataService";
import {
  chapterForPageContent,
  chapterOf,
  getEntity,
  ruleCard,
  targetPageForEntity,
} from "../services/tajweedSelectors";
import { INITIAL_PANEL_STATE, type PanelState } from "../types/panel";
import { PAGE_QUERY_PARAM, VIEW_MODE_QUERY_PARAM, type MobilePaneView, type ViewMode } from "../types/navigation";
import { CLEAN_EDITION_MIN_PAGE, DEFAULT_INITIAL_PAGE } from "../constants/ui";
import { highlightSelected } from "../utils/bookPageDom";

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
  showChapter: (chapterId: string, targetPane?: MobilePaneView) => void;
  returnToIntro: (targetPane?: MobilePaneView) => void;
  toggleViewMode: () => void;
  mobilePane: MobilePaneView;
  setMobilePane: (pane: MobilePaneView) => void;
  toggleMobilePane: () => void;
}

function clampPage(pageNumber: number, pageCount: number): number {
  return Math.min(pageCount, Math.max(1, pageNumber));
}

function readInitialPage(searchParams: URLSearchParams, pageCount: number): number {
  const raw = Number(searchParams.get(PAGE_QUERY_PARAM));
  if (Number.isInteger(raw) && raw >= 1 && raw <= pageCount) {
    return raw;
  }
  return Math.min(pageCount, DEFAULT_INITIAL_PAGE);
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
  const [mobilePane, setMobilePane] = useState<MobilePaneView>("book");

  const toggleMobilePane = useCallback(() => {
    setMobilePane((prev) => (prev === "book" ? "panel" : "book"));
  }, []);

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
      const preferClean = pageNumber >= CLEAN_EDITION_MIN_PAGE;
      const targetPage = rule ? targetPageForEntity(dataset, rule, preferClean) : null;

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
      setMobilePane("panel");
    },
    [dataset, goToBookPageOnly, pageNumber, selectEntity],
  );

  const openMakhraj = useCallback((regionIds: string[]) => {
    setPanelState((previous) => ({ ...previous, tab: "makhraj", focusRegions: regionIds }));
    setMobilePane("panel");
  }, []);

  const showBayt = useCallback(
    (baytId: string) => {
      const bayt = getEntity(dataset, baytId);
      const preferClean = pageNumber >= CLEAN_EDITION_MIN_PAGE;
      const targetPage = bayt ? targetPageForEntity(dataset, bayt, preferClean) : null;
      if (targetPage) {
        if (targetPage !== pageNumber) {
          goToBookPageOnly(targetPage);
        }
        const chapter = chapterOf(dataset, bayt);
        if (chapter) {
          setPanelState({ ...INITIAL_PANEL_STATE, chapterId: chapter.id });
        }
        selectEntity(baytId);
        setMobilePane("book");
      }
    },
    [dataset, goToBookPageOnly, pageNumber, selectEntity],
  );

  const showChapter = useCallback(
    (chapterId: string, targetPane?: MobilePaneView) => {
      const chapter = getEntity(dataset, chapterId);
      if (!chapter) return;
      const targetAnchor =
        chapter.anchors.find((anchor) => anchor.page >= CLEAN_EDITION_MIN_PAGE) ??
        chapter.anchors[0];
      if (targetAnchor) {
        setPanelState({ ...INITIAL_PANEL_STATE, chapterId });
        if (targetAnchor.page !== pageNumber) {
          goToBookPageOnly(targetAnchor.page);
        } else {
          const container = document.querySelector<HTMLElement>(".book-scroll-area");
          if (container) {
            highlightSelected(container, chapterId);
            if (chapterId === "chapter.muqaddimah") {
              container.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        }
        selectEntity(chapterId);
        setMobilePane(targetPane ?? "book");
      }
    },
    [dataset, goToBookPageOnly, pageNumber, selectEntity],
  );

  const returnToIntro = useCallback(
    (targetPane?: MobilePaneView) => {
      showChapter("chapter.muqaddimah", targetPane);
    },
    [showChapter],
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
      returnToIntro,
      toggleViewMode,
      mobilePane,
      setMobilePane,
      toggleMobilePane,
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
      returnToIntro,
      toggleViewMode,
      mobilePane,
      setMobilePane,
      toggleMobilePane,
    ],
  );
}

export function useRuleCard(dataset: TajweedDataset, ruleId: string | null) {
  return ruleId ? ruleCard(dataset, ruleId) : null;
}
