import type { ChapterEntity } from "../../types/entities";

export interface ChapterHeroProps {
  chapter: ChapterEntity;
}

export function ChapterHero({ chapter }: ChapterHeroProps) {
  const { bayt_range, stated_count } = chapter.metadata;
  return (
    <div className="chapter-hero" data-entity-id={chapter.id}>
      <h2>{chapter.label_ar}</h2>
      <div className="range">
        الأبيات {bayt_range[0]}–{bayt_range[1]}
        {stated_count ? ` · المتن يذكر عددها: ${stated_count}` : ""}
      </div>
    </div>
  );
}
