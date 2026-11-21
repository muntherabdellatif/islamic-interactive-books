export type BookType =
  | "tajweed"
  | "isnad"
  | "fiqh"
  | "aqeedah"
  | "hadith"
  | "usul"
  | "arabic"
  | "seerah"
  | "faraid";

export type BookStatus = "available" | "coming-soon";

export type LearningPathId =
  | "quran-recitation"
  | "hadith-transmission"
  | "hadith-terminology"
  | "comparative-fiqh"
  | "aqeedah-foundations"
  | "usul-and-qawaid"
  | "arabic-grammar"
  | "prophetic-seerah"
  | "inheritance-math";

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
