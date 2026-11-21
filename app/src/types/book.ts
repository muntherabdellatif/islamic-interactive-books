export type BookType = "tajweed" | "isnad" | "fiqh" | "aqeedah";

export type BookStatus = "available" | "coming-soon";

export type LearningPathId =
  | "quran-recitation"
  | "hadith-transmission"
  | "comparative-fiqh"
  | "aqeedah-foundations";

export interface LearningPath {
  id: LearningPathId;
  titleAr: string;
  descriptionAr: string;
}

export interface BookSummary {
  id: string;
  titleAr: string;
  authorAr: string;
  type: BookType;
  status: BookStatus;
  pageCount: number;
  learningPathIds: LearningPathId[];
  descriptionAr: string;
}

export interface BookTypeInfo {
  id: BookType;
  titleAr: string;
  interactiveIdeaAr: string;
}
