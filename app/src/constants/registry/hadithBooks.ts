import type { BookSummary } from "../../types/book";

export const HADITH_BOOKS: readonly BookSummary[] = [
  {
    id: "al-arbaun-al-nawawiyyah",
    titleAr: "الأربعون النووية",
    authorAr: "يحيى بن شرف النووي",
    type: "hadith",
    status: "coming-soon",
    pageCount: 170,
    learningPathIds: ["hadith-terminology"],
    descriptionAr:
      "اثنان وأربعون حديثاً نبوياً تدور عليها قواعد الإسلام، مع شبكة تفاعلية لتراجم الرواة واستخراج القواعد الفقهية والتربوية.",
  },
  {
    id: "al-manzumah-al-bayquniyyah",
    titleAr: "المنظومة البيقونية في مصطلح الحديث",
    authorAr: "عمر بن محمد البيقوني",
    type: "hadith",
    status: "coming-soon",
    pageCount: 18,
    learningPathIds: ["hadith-terminology"],
    descriptionAr:
      "منظومة موجزة محكمة (34 بيتاً) تُعرّف بأقسام الحديث وأنواعه، مع شجرة قرارات لتصنيف الحديث طبقاً لصفات سنده ومتنه.",
  },
  {
    id: "nukhbat-al-fikar",
    titleAr: "نخبة الفكر في مصطلح أهل الأثر",
    authorAr: "ابن حجر العسقلاني",
    type: "hadith",
    status: "coming-soon",
    pageCount: 8,
    learningPathIds: ["hadith-terminology"],
    descriptionAr:
      "عمدة أصول الحديث المنطقي؛ تقسيمات حصرية دقيقة للخبر المتواتر والآحاد والمقبول والمردود وشروط الصحة والعلل.",
  },
  {
    id: "al-nashr",
    titleAr: "النشر في القراءات العشر (أسانيد)",
    authorAr: "ابن الجزري",
    type: "isnad",
    status: "coming-soon",
    pageCount: 985,
    learningPathIds: ["hadith-transmission"],
    descriptionAr:
      "شجيرات أسانيد وطرق رواية القراءات العشر عبر الطبقات حتى النبي ﷺ، متصلة بقواعد بيانات الرواة والأئمة.",
  },
];
