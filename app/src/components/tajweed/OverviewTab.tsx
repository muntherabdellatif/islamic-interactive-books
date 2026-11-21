import type { TajweedDataset } from "../../services/tajweedDataService";
import type { ChapterEntity } from "../../types/entities";
import { chapterVideos, leafRulesOfChapter, quizFor } from "../../services/tajweedSelectors";
import { ChapterHero } from "./ChapterHero";
import { VideoSection } from "./VideoSection";
import { RuleTreeList } from "./RuleTreeList";
import { LetterPicker } from "./LetterPicker";
import { BaytCommentarySection } from "./BaytCommentarySection";
import { BookIntro } from "./BookIntro";
import { QuizSection } from "./QuizSection";

export interface OverviewTabProps {
  dataset: TajweedDataset;
  chapter: ChapterEntity;
  onPickRule: (ruleId: string) => void;
  onShowBayt: (baytId: string) => void;
  onShowChapter: (chapterId: string) => void;
}

export function OverviewTab({ dataset, chapter, onPickRule, onShowBayt, onShowChapter }: OverviewTabProps) {
  const leafRules = leafRulesOfChapter(dataset, chapter);
  const quiz = quizFor(dataset, chapter.id);
  const videos = chapterVideos(dataset, chapter.id);

  if (!leafRules.length) {
    // Chapters 1 (المقدمة) and 10 (الخاتمة) carry no tajweed rules of their own.
    return (
      <>
        <ChapterHero chapter={chapter} />
        <VideoSection videos={videos} />
        <BookIntro dataset={dataset} onShowChapter={onShowChapter} />
      </>
    );
  }

  return (
    <>
      <ChapterHero chapter={chapter} />
      <VideoSection videos={videos} />
      <div className="panel-section">
        <div className="panel-section-title">أحكام هذا الباب</div>
        <RuleTreeList dataset={dataset} rules={leafRules} onPickRule={onPickRule} />
      </div>
      <LetterPicker dataset={dataset} chapter={chapter} onPickRule={onPickRule} />
      <BaytCommentarySection dataset={dataset} chapter={chapter} onShowBayt={onShowBayt} />
      <div className="panel-section">
        <button type="button" className="show-in-book-btn" onClick={() => onShowChapter(chapter.id)}>
          📖 بيّن هذا الباب في الكتاب
        </button>
      </div>
      <QuizSection chapter={chapter} questions={quiz} />
    </>
  );
}
