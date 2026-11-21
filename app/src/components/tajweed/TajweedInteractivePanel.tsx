import { useEffect, useRef } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { BookViewerController } from "../../hooks/useBookViewerController";
import { getEntity, isLeafRule, leafRulesOfChapter, relatedEntitiesOfType } from "../../services/tajweedSelectors";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useSelection } from "../../context/SelectionContext";
import type { ChapterEntity, TajweedRuleEntity } from "../../types/entities";
import { PanelTabBar } from "../interactive/PanelTabBar";
import { OverviewTab } from "./OverviewTab";
import { RuleDetail } from "./RuleDetail";
import { MakhrajPanel } from "./Makhraj/MakhrajPanel";
import { NonChapterPage } from "./NonChapterPage";

export interface TajweedInteractivePanelProps {
  dataset: TajweedDataset;
  pageNumber: number;
  controller: BookViewerController;
}

export function TajweedInteractivePanel({ dataset, pageNumber, controller }: TajweedInteractivePanelProps) {
  const { panelState, setPanelTab, selectRule, openMakhraj, showBayt, showChapter } = controller;
  const audioPlayer = useAudioPlayer();
  const { selectedEntityId } = useSelection();
  const panelRef = useRef<HTMLDivElement>(null);

  const chapter = panelState.chapterId ? getEntity(dataset, panelState.chapterId) : null;

  useEffect(() => {
    if (!selectedEntityId) return;
    const container = panelRef.current;
    const existing = container?.querySelector(`[data-entity-id="${selectedEntityId}"]`);
    if (existing) {
      container?.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
      existing.classList.add("selected");
      existing.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const entity = getEntity(dataset, selectedEntityId);
    if (entity?.type === "bayt") {
      const rules = relatedEntitiesOfType(dataset, entity, "tajweed_rule").filter(isLeafRule);
      if (rules[0]) selectRule(rules[0].id);
      else setPanelTab("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntityId]);

  if (!chapter || chapter.type !== "chapter") {
    return (
      <section className="pane pane-panel" dir="rtl" aria-label="الجزء التفاعلي" ref={panelRef}>
        <NonChapterPage dataset={dataset} pageNumber={pageNumber} onShowChapter={showChapter} />
      </section>
    );
  }

  const typedChapter = chapter as ChapterEntity;
  const leafRules = leafRulesOfChapter(dataset, typedChapter);
  const activeRule =
    panelState.tab === "rule" && panelState.ruleId
      ? (getEntity(dataset, panelState.ruleId) as TajweedRuleEntity | null)
      : null;

  return (
    <section className="pane pane-panel" dir="rtl" aria-label="الجزء التفاعلي" ref={panelRef}>
      <PanelTabBar
        dataset={dataset}
        leafRules={leafRules}
        activeTab={panelState.tab}
        activeRuleId={panelState.ruleId}
        onSelectOverview={() => setPanelTab("overview")}
        onSelectRule={selectRule}
        onSelectMakhraj={() => openMakhraj([])}
      />
      <div className="panel-tab-body">
        {panelState.tab === "overview" ? (
          <OverviewTab
            dataset={dataset}
            chapter={typedChapter}
            onPickRule={selectRule}
            onShowBayt={showBayt}
            onShowChapter={showChapter}
          />
        ) : null}
        {panelState.tab === "rule" && activeRule ? (
          <RuleDetail
            dataset={dataset}
            rule={activeRule}
            audioPlayer={audioPlayer}
            onOpenMakhraj={openMakhraj}
            onShowBayt={showBayt}
          />
        ) : null}
        {panelState.tab === "makhraj" ? <MakhrajPanel dataset={dataset} focusRegions={panelState.focusRegions} /> : null}
      </div>
    </section>
  );
}
