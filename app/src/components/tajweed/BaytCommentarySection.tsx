import type { TajweedDataset } from "../../services/tajweedDataService";
import type { ChapterEntity } from "../../types/entities";
import { baytCommentary, baytsOfChapter } from "../../services/tajweedSelectors";

export interface BaytCommentarySectionProps {
  dataset: TajweedDataset;
  chapter: ChapterEntity;
  onShowBayt: (baytId: string) => void;
}

/** Plain-language explanation of what each bayt of this chapter actually says, bayt by bayt. */
export function BaytCommentarySection({ dataset, chapter, onShowBayt }: BaytCommentarySectionProps) {
  const bayts = baytsOfChapter(dataset, chapter).filter((bayt) => baytCommentary(dataset, bayt.id));
  if (!bayts.length) return null;

  return (
    <div className="panel-section">
      <div className="panel-section-title">📜 شرح أبيات هذا الباب (بيت بيت)</div>
      {bayts.map((bayt) => (
        <div key={bayt.id} className="card bayt-commentary-card" data-entity-id={bayt.id}>
          <div className="bayt-commentary-head">
            <span className="chip">بيت {bayt.metadata.number}</span>
            <button type="button" className="show-in-book-btn" onClick={() => onShowBayt(bayt.id)}>
              📖 بيّن في الكتاب
            </button>
          </div>
          <p className="bayt-commentary-text">{baytCommentary(dataset, bayt.id)}</p>
        </div>
      ))}
    </div>
  );
}
