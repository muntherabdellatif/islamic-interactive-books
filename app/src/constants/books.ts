import type { BookSummary, BookTypeInfo, LearningPath } from "../types/book";

export const BOOK_TYPES: readonly BookTypeInfo[] = [
  {
    id: "isnad",
    titleAr: "كتب الأسانيد الكبرى",
    interactiveIdeaAr: "شجيرات أسانيد وطرق رواية تفاعلية، طبقة بعد طبقة وصولاً إلى النبي ﷺ.",
  },
  {
    id: "tajweed",
    titleAr: "كتب تعليم التلاوة والتجويد",
    interactiveIdeaAr: "محاكاة بصرية وصوتية لمخارج الحروف وأحكام التجويد مع أمثلة قرآنية مسموعة.",
  },
  {
    id: "fiqh",
    titleAr: "كتب الفقه المقارن والمذاهب",
    interactiveIdeaAr: "شجرة قرارات فقهية تفاعلية تتفرع بحسب المسألة مع الأدلة والمذاهب.",
  },
  {
    id: "aqeedah",
    titleAr: "كتب المتون العقدية والأصول",
    interactiveIdeaAr: "مسارات تعلم وبطاقات معرفية واختبارات ذاتية لحفظ القواعد وفهمها.",
  },
];

export const LEARNING_PATHS: readonly LearningPath[] = [
  {
    id: "quran-recitation",
    titleAr: "مسار تعلم التلاوة والتجويد",
    descriptionAr: "من مخارج الحروف إلى أحكام النون والميم والمدود، بالأمثلة الصوتية.",
  },
  {
    id: "hadith-transmission",
    titleAr: "مسار علوم الحديث والأسانيد",
    descriptionAr: "تتبع سلاسل الرواة وطرق التحمل والأداء عبر الطبقات.",
  },
  {
    id: "comparative-fiqh",
    titleAr: "مسار الفقه المقارن",
    descriptionAr: "مقارنة أحكام المذاهب الأربعة مسألة بمسألة.",
  },
  {
    id: "aqeedah-foundations",
    titleAr: "مسار أصول العقيدة",
    descriptionAr: "القواعد الكبرى في العقيدة وأدلتها الشرعية.",
  },
];

export const BOOK_REGISTRY: readonly BookSummary[] = [
  {
    id: "tuhfat-al-atfal",
    titleAr: "تحفة الأطفال والغلمان في تجويد القرآن",
    authorAr: "سليمان الجمزوري",
    type: "tajweed",
    status: "available",
    pageCount: 29,
    learningPathIds: ["quran-recitation"],
    descriptionAr:
      "متن تجويدي مختصر يشرح أحكام النون الساكنة والتنوين، والميم الساكنة، واللامات، والمدود.",
  },
  {
    id: "al-nashr",
    titleAr: "النشر في القراءات العشر",
    authorAr: "ابن الجزري",
    type: "isnad",
    status: "coming-soon",
    pageCount: 985,
    learningPathIds: ["hadith-transmission"],
    descriptionAr: "شجيرات أسانيد وطرق رواية القراءات العشر، مُعلَّق حالياً لصالح كتاب أصغر.",
  },
  {
    id: "matn-abi-shuja",
    titleAr: "متن أبي شجاع (الغاية والتقريب)",
    authorAr: "أبو شجاع الأصفهاني",
    type: "fiqh",
    status: "coming-soon",
    pageCount: 177,
    learningPathIds: ["comparative-fiqh"],
    descriptionAr: "متن فقهي في الفقه الشافعي، لم يبدأ استخراج بياناته التفاعلية بعد.",
  },
  {
    id: "al-usul-al-thalatha",
    titleAr: "الأصول الثلاثة وأدلتها",
    authorAr: "محمد بن عبد الوهاب",
    type: "aqeedah",
    status: "coming-soon",
    pageCount: 26,
    learningPathIds: ["aqeedah-foundations"],
    descriptionAr: "متن عقدي مختصر، لم يبدأ استخراج بياناته التفاعلية بعد.",
  },
];

export const AVAILABLE_BOOK_IDS: readonly string[] = BOOK_REGISTRY.filter(
  (book) => book.status === "available",
).map((book) => book.id);

export function getBookById(bookId: string): BookSummary | undefined {
  return BOOK_REGISTRY.find((book) => book.id === bookId);
}
