import type { CSSProperties } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { TajweedRuleEntity } from "../../types/entities";
import { categoryColor, relatedEntitiesOfType, ruleCard, ruleVideos } from "../../services/tajweedSelectors";
import { ruleIcon } from "../../utils/ruleIcon";
import type { AudioPlayer } from "../../hooks/useAudioPlayer";
import { VideoSection } from "./VideoSection";
import { LetterChips } from "./LetterChips";
import { MakhrajInline } from "./Makhraj/MakhrajInline";
import { MnemonicBox } from "./MnemonicBox";
import { ExampleRows } from "./ExampleRows";

export interface RuleDetailProps {
  dataset: TajweedDataset;
  rule: TajweedRuleEntity;
  audioPlayer: AudioPlayer;
  onOpenMakhraj: (regionIds: string[]) => void;
  onShowBayt: (baytId: string) => void;
}

export function RuleDetail({ dataset, rule, audioPlayer, onOpenMakhraj, onShowBayt }: RuleDetailProps) {
  const interactive = ruleCard(dataset, rule.id);
  const color = categoryColor(dataset, rule.metadata.category);
  const letterSets = relatedEntitiesOfType(dataset, rule, "letter_set");
  const mnemonics = relatedEntitiesOfType(dataset, rule, "mnemonic");
  const matnExamples = relatedEntitiesOfType(dataset, rule, "example_word");
  const relatedBayts = [...relatedEntitiesOfType(dataset, rule, "bayt")].sort(
    (a, b) => a.metadata.number - b.metadata.number,
  );
  const quoteBayt = relatedBayts[0];

  return (
    <div className="rule-detail" style={{ "--card-color": color } as CSSProperties} data-entity-id={rule.id}>
      <div className="rule-title">
        {ruleIcon(rule.id)} {rule.label_ar}
      </div>
      <div className="rule-simplified">{interactive?.simplified_ar ?? ""}</div>

      <VideoSection videos={ruleVideos(dataset, rule.id)} />

      {letterSets.length ? (
        <>
          <div className="panel-subsection-title">متى يُطبَّق؟</div>
          <LetterChips letterSets={letterSets} />
        </>
      ) : null}

      <div className="panel-subsection-title">كيف يُنطق؟ من أين يخرج؟</div>
      <MakhrajInline dataset={dataset} regionIds={interactive?.makhraj_regions ?? []} />
      {interactive?.makhraj_note_ar ? <p className="makhraj-note">{interactive.makhraj_note_ar}</p> : null}
      <button
        type="button"
        className="rule-card-actions-btn"
        onClick={() => onOpenMakhraj(interactive?.makhraj_regions ?? [])}
      >
        🗺️ افتح الخريطة الكاملة للمخارج
      </button>

      {mnemonics.length ? (
        <>
          <div className="panel-subsection-title">رمز يساعدك على الحفظ</div>
          <MnemonicBox mnemonics={mnemonics} />
        </>
      ) : null}

      <div className="panel-subsection-title">أمثلة مسموعة</div>
      <ExampleRows
        dataset={dataset}
        matnExamples={matnExamples}
        supplementary={interactive?.supplementary_examples ?? []}
        audioPlayer={audioPlayer}
      />

      {quoteBayt ? (
        <>
          <div className="panel-subsection-title">من المتن</div>
          <div className="matn-quote-box">
            <span>{quoteBayt.metadata.shatr1_text}</span> — <span>{quoteBayt.metadata.shatr2_text}</span>
            <div className="matn-quote-action">
              <button type="button" className="show-in-book-btn" onClick={() => onShowBayt(quoteBayt.id)}>
                📖 بيّن في الكتاب
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
