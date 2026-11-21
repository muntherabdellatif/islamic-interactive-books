import type { BookSummary } from "../../types/book";

export const ARABIC_BOOKS: readonly BookSummary[] = [
  {
    id: "al-ajrumiyyah",
    titleAr: "الآجرومية في علم العربية",
    authorAr: "محمد بن محمد بن آجرّوم الصنهاجي",
    type: "arabic",
    status: "coming-soon",
    pageCount: 20,
    learningPathIds: ["arabic-grammar"],
    descriptionAr:
      "المتن النحوي الأوسع انتشاراً؛ شجرة إعراب تفاعلية للمرفوعات والمنصوبات والمجرورات والمجزومات مع تلوين دلالي.",
  },
  {
    id: "mulhat-al-irab",
    titleAr: "ملحة الإعراب",
    authorAr: "القاسم بن علي الحريري",
    type: "arabic",
    status: "coming-soon",
    pageCount: 30,
    learningPathIds: ["arabic-grammar"],
    descriptionAr:
      "أرجوزة نحوية تعليمية رشيقة (375 بيتاً) تُقرّب أبواب النحو واللغة بأمثلة وشواهد شعرية وتمارين إعرابية تفاعلية.",
  },
  {
    id: "miat-al-maani-wal-bayan",
    titleAr: "مائة المعاني والبيان",
    authorAr: "محب الدين ابن الشحنة الحلبي",
    type: "arabic",
    status: "coming-soon",
    pageCount: 14,
    learningPathIds: ["arabic-grammar"],
    descriptionAr:
      "مئة بيت تجمع أصول علوم البلاغة الثلاثة (المعاني والبيان والبديع) مع مستكشف تفاعلي للصور والأسرار البلاغية القرآنية.",
  },
];
