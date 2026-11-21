import type { TajweedDataset } from "../../services/tajweedDataService";
import type { ChapterEntity } from "../../types/entities";
import { categoryColor, getEntity, letterPartitionForChapter } from "../../services/tajweedSelectors";

export interface LetterPickerProps {
  dataset: TajweedDataset;
  chapter: ChapterEntity;
  onPickRule: (ruleId: string) => void;
}

export function LetterPicker({ dataset, chapter, onPickRule }: LetterPickerProps) {
  const partition = letterPartitionForChapter(dataset, chapter);
  if (!partition) return null;

  return (
    <div className="letter-picker">
      <p className="letter-picker-hint">اضغط أي حرف لترى أي حكم يُطبَّق عليه بعد هذا الباب:</p>
      <div className="letter-set">
        {[...partition.entries()].map(([letter, ruleId]) => {
          const rule = getEntity(dataset, ruleId);
          const category = (rule?.metadata as { category?: string } | undefined)?.category;
          const color = category ? categoryColor(dataset, category) : undefined;
          return (
            <button
              key={letter}
              type="button"
              className="letter-chip letter-chip-pick"
              style={{ borderColor: color }}
              onClick={() => onPickRule(ruleId)}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
