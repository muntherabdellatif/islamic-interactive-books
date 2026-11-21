import { useState } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { ChapterEntity, DefinitionEntity } from "../../types/entities";
import { entitiesOfType, getEntity } from "../../services/tajweedSelectors";
import { BOOK_INTRO_SECRET_IDS } from "../../constants/tajweedLabels";

export interface BookIntroProps {
  dataset: TajweedDataset;
  onShowChapter: (chapterId: string) => void;
}

function SecretFactCard({ secret }: { secret: DefinitionEntity }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`secret-fact-card ${open ? "open" : ""}`} onClick={() => setOpen((v) => !v)}>
      <strong>{secret.metadata.term}</strong> 🔍
      <div className="reveal">{secret.metadata.definition_ar}</div>
    </div>
  );
}

/** Table of contents + the two jummal-count "secrets", shown on the title/intro/closing pages. */
export function BookIntro({ dataset, onShowChapter }: BookIntroProps) {
  const chapters = [...entitiesOfType<"chapter">(dataset, "chapter")].sort(
    (a: ChapterEntity, b: ChapterEntity) => a.metadata.order - b.metadata.order,
  );
  const secrets = BOOK_INTRO_SECRET_IDS.map((id) => getEntity(dataset, id) as DefinitionEntity | null).filter(
    (entity): entity is DefinitionEntity => entity !== null,
  );

  return (
    <div className="panel-section">
      <div className="intro-card">
        <strong>تحفة الأطفال والغلمان</strong> منظومة من 61 بيتاً شعرياً، نظمها سليمان الجمزوري ليعلّم أحكام تجويد
        القرآن الكريم بطريقة ميسّرة سهلة الحفظ. كل باب يشرح حكماً أو مجموعة أحكام، بأمثلة وأحرف ورموز تساعد على
        تثبيتها.
      </div>
      <div className="panel-section-title">محتوى الكتاب</div>
      <div className="chapter-map">
        {chapters.map((chapter) => (
          <button key={chapter.id} type="button" className="chapter-map-item" onClick={() => onShowChapter(chapter.id)}>
            <span className="cm-order">{chapter.metadata.order}</span>
            <span>
              {chapter.label_ar}{" "}
              <span className="chapter-map-range">
                (الأبيات {chapter.metadata.bayt_range[0]}-{chapter.metadata.bayt_range[1]})
              </span>
            </span>
          </button>
        ))}
      </div>
      {secrets.length > 0 ? (
        <>
          <div className="panel-section-title">أسرار رقمية في المنظومة</div>
          {secrets.map((secret) => (
            <SecretFactCard key={secret.id} secret={secret} />
          ))}
        </>
      ) : null}
    </div>
  );
}
