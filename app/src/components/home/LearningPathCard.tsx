import type { LearningPath } from "../../types/book";

export function LearningPathCard({ path }: { path: LearningPath }) {
  return (
    <div className="learning-path-card">
      <div className="learning-path-title">{path.titleAr}</div>
      <p className="learning-path-description">{path.descriptionAr}</p>
    </div>
  );
}
