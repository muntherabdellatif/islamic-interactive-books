import { useState } from "react";
import type { ChapterEntity } from "../../types/entities";
import type { QuizQuestion } from "../../types/interactive";

function QuizCard({ question }: { question: QuizQuestion }) {
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);

  return (
    <div className="card quiz-card">
      <div className="quiz-question">{question.question_ar}</div>
      <div className="quiz-choices">
        {question.choices_ar.map((choice, choiceIndex) => {
          const isAnswered = chosenIndex !== null;
          const isCorrect = choiceIndex === question.answer_index;
          const isChosen = choiceIndex === chosenIndex;
          const className = [
            "quiz-choice",
            isAnswered && isCorrect ? "correct" : "",
            isAnswered && isChosen && !isCorrect ? "wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={choiceIndex}
              type="button"
              className={className}
              disabled={isAnswered}
              onClick={() => setChosenIndex(choiceIndex)}
            >
              {choice}
            </button>
          );
        })}
      </div>
      <div className={`quiz-explanation ${chosenIndex !== null ? "shown" : ""}`}>{question.explanation_ar}</div>
    </div>
  );
}

export interface QuizSectionProps {
  chapter: ChapterEntity;
  questions: readonly QuizQuestion[];
}

export function QuizSection({ chapter, questions }: QuizSectionProps) {
  if (!questions.length) return null;
  return (
    <div className="panel-section">
      <div className="panel-section-title">🧠 تطبيق سريع على باب «{chapter.label_ar}»</div>
      {questions.map((question, index) => (
        <QuizCard key={index} question={question} />
      ))}
    </div>
  );
}
