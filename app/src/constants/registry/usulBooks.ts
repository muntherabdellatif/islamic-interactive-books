import type { BookSummary } from "../../types/book";

export const USUL_BOOKS: readonly BookSummary[] = [
  {
    id: "al-waraqat",
    titleAr: "الورقات في أصول الفقه",
    authorAr: "عبد الملك بن عبد الله الجويني (إمام الحرمين)",
    type: "usul",
    status: "coming-soon",
    pageCount: 16,
    learningPathIds: ["usul-and-qawaid"],
    descriptionAr:
      "المتن الوجيز الأشهر في أصول الفقه؛ خريطة مفاهيمية لمباحث الأمر، والنهي، والعام، والخاص، والإجماع، والقياس.",
  },
  {
    id: "al-qawaid-al-fiqhiyyah-al-kubra",
    titleAr: "القواعد الفقهية الخمس الكبرى",
    authorAr: "جلال الدين عبد الرحمن السيوطي (ت 911 هـ)",
    type: "usul",
    status: "coming-soon",
    pageCount: 16,
    learningPathIds: ["usul-and-qawaid"],
    descriptionAr:
      "القواعد الخمس الكلية التي يدور عليها الفقه الإسلامي (الأمور بمقاصدها، اليقين، المشقة، الضرر، العادة) مع تفريعاتها ونوازلها.",
  },
];
