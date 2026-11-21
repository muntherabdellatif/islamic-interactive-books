import type { BookSummary, BookTypeInfo, LearningPath } from "../types/book";
import { TAJWEED_BOOKS } from "./registry/tajweedBooks";
import { HADITH_BOOKS } from "./registry/hadithBooks";
import { FIQH_BOOKS } from "./registry/fiqhBooks";
import { USUL_BOOKS } from "./registry/usulBooks";
import { AQEEDAH_BOOKS } from "./registry/aqeedahBooks";
import { ARABIC_BOOKS } from "./registry/arabicBooks";
import { SEERAH_BOOKS } from "./registry/seerahBooks";

export const BOOK_TYPES: readonly BookTypeInfo[] = [
  {
    id: "tajweed",
    titleAr: "التلاوة والتجويد والقراءات",
    interactiveIdeaAr: "محاكاة بصرية وصوتية لمخارج وصفات الحروف، ومقارنة أوجه القراءات بأمثلة مسموعة.",
  },
  {
    id: "hadith",
    titleAr: "الحديث وعلومه ومصطلحه",
    interactiveIdeaAr: "شجرة قرارات تصنيف الحديث وشبكات أسانيد وتراجم الرواة والفوائد الحديثية.",
  },
  {
    id: "fiqh",
    titleAr: "الفقه والمتون المذهبية",
    interactiveIdeaAr: "شجرة قرارات فقهية تتفرع بحسب المسألة مع شروطها وأركانها وأدلتها المعتمدة.",
  },
  {
    id: "faraid",
    titleAr: "الفرائض والمواريث",
    interactiveIdeaAr: "حاسبة مواريث شرعية تفاعلية تقسم التركات وتبين استحقاق كل وارث وسنده من المنظومة.",
  },
  {
    id: "usul",
    titleAr: "أصول الفقه والقواعد",
    interactiveIdeaAr: "خرائط مفاهيمية للأدلة الإجمالية والقواعد الفقهية الكبرى وتطبيقاتها المعاصرة.",
  },
  {
    id: "aqeedah",
    titleAr: "العقيدة وأصول الدين",
    interactiveIdeaAr: "مسارات استدلال قرآني وبطاقات تفاعلية لحفظ القواعد وتثبيت مسائل الإيمان.",
  },
  {
    id: "arabic",
    titleAr: "علوم العربية والنحو والبلاغة",
    interactiveIdeaAr: "شجرة إعراب تفاعلية تلوّن التراكيب وتكشف علامات الإعراب والأسرار البلاغية.",
  },
  {
    id: "seerah",
    titleAr: "السيرة والشمائل النبوية",
    interactiveIdeaAr: "خط زمني جغرافي تفاعلي لأحداث العهدين المكي والمدني وبطاقات مصورة للشمائل الشريفة.",
  },
  {
    id: "isnad",
    titleAr: "الأسانيد الكبرى",
    interactiveIdeaAr: "شجيرات أسانيد وطرق رواية كبرى، طبقة بعد طبقة وصولاً إلى النبي ﷺ.",
  },
];

export const LEARNING_PATHS: readonly LearningPath[] = [
  {
    id: "quran-recitation",
    titleAr: "مسار التلاوة والتجويد والقراءات",
    descriptionAr: "إتقان مخارج وصفات الحروف وأحكام النون والميم والمدود وقواعد القراءات.",
  },
  {
    id: "hadith-terminology",
    titleAr: "مسار الحديث الشريف ومصطلحه",
    descriptionAr: "دراسة قواعد التصنيف الحديثي والأحاديث الجامعة وفهم مصطلح أهل الأثر.",
  },
  {
    id: "comparative-fiqh",
    titleAr: "مسار الفقه وأحكام الشريعة",
    descriptionAr: "أبواب العبادات والمعاملات على معتمد المذاهب الأربعة عبر شجرات فقهية مبسطة.",
  },
  {
    id: "inheritance-math",
    titleAr: "مسار علم الفرائض وتوزيع التركات",
    descriptionAr: "فهم أصحاب الفروض والعصبات والحجب وتطبيقها عبر الحاسبة التفاعلية.",
  },
  {
    id: "usul-and-qawaid",
    titleAr: "مسار أصول الفقه والقواعد الكلية",
    descriptionAr: "مدخل استنباط الأحكام وفهم القواعد الفقهية الكبرى وتفريع النوازل عليها.",
  },
  {
    id: "aqeedah-foundations",
    titleAr: "مسار أصول العقيدة والإيمان",
    descriptionAr: "القواعد الكبرى في توحيد الله ومعرفة نبيه ﷺ وأدلتها القرآنية والسنية.",
  },
  {
    id: "arabic-grammar",
    titleAr: "مسار علوم لغة القرآن والنحو",
    descriptionAr: "التدرج في فهم الإعراب من الآجرومية والبلاغة عبر شجرات بصرية تفاعلية.",
  },
  {
    id: "prophetic-seerah",
    titleAr: "مسار السيرة والشمائل المحمدية",
    descriptionAr: "تتبع سيرة النبي ﷺ وشمائله وأخلاقه الشريفة عبر خط زمني متتابع.",
  },
  {
    id: "hadith-transmission",
    titleAr: "مسار أسانيد القراءات الكبرى",
    descriptionAr: "تتبع أسانيد القراءات العشر وطرق روايتها عبر الطبقات حتى النبي ﷺ.",
  },
];

export const BOOK_REGISTRY: readonly BookSummary[] = [
  ...TAJWEED_BOOKS,
  ...HADITH_BOOKS,
  ...FIQH_BOOKS,
  ...USUL_BOOKS,
  ...AQEEDAH_BOOKS,
  ...ARABIC_BOOKS,
  ...SEERAH_BOOKS,
];

export const AVAILABLE_BOOK_IDS: readonly string[] = BOOK_REGISTRY.filter(
  (book) => book.status === "available",
).map((book) => book.id);

export const BOOKS_PER_PAGE = 8;

export function getBookById(bookId: string): BookSummary | undefined {
  return BOOK_REGISTRY.find((book) => book.id === bookId);
}
