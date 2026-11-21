import type { BookSummary } from "../../types/book";

export const SEERAH_BOOKS: readonly BookSummary[] = [
  {
    id: "al-urjuzah-al-miiyyah",
    titleAr: "الأرجوزة الميئية في ذكر حال أشرف البرية",
    authorAr: "علي بن علي بن أبي العز الحنفي",
    type: "seerah",
    status: "coming-soon",
    pageCount: 14,
    learningPathIds: ["prophetic-seerah"],
    descriptionAr:
      "مئة بيت شعري ترتب وقائع السيرة النبوية زمنياً سنة بسنة من الميلاد حتى الوفاة، مع خط زمني جغرافي تفاعلي.",
  },
  {
    id: "al-shamail-al-muhammadiyyah",
    titleAr: "الشمائل المحمدية (مختصر)",
    authorAr: "محمد بن عيسى الترمذي",
    type: "seerah",
    status: "coming-soon",
    pageCount: 46,
    learningPathIds: ["prophetic-seerah"],
    descriptionAr:
      "الأوصاف الخِلقية والخُلقية للنبي ﷺ وسيرته في مأكله وملبسه ونومه وعبادته، في بطاقات مصورة موثقة بالسنة المطهرة.",
  },
];
