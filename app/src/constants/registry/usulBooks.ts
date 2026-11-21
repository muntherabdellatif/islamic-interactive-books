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
    id: "manzumat-al-qawaid-al-fiqhiyyah",
    titleAr: "منظومة القواعد الفقهية",
    authorAr: "عبد الرحمن بن ناصر السعدي",
    type: "usul",
    status: "coming-soon",
    pageCount: 12,
    learningPathIds: ["usul-and-qawaid"],
    descriptionAr:
      "منظومة رائية (48 بيتاً) تلخص القواعد الفقهية الكبرى والكلية والضوابط مع محاكاة تفاعلية لتطبيقاتها في النوازل المعاصرة.",
  },
];
