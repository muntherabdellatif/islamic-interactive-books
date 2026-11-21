import type { BookSummary } from "../../types/book";

export const TAJWEED_BOOKS: readonly BookSummary[] = [
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
    id: "al-jazariyyah",
    titleAr: "المقدمة الجزرية (متن الجزرية)",
    authorAr: "محمد بن الجزري الشافعي",
    type: "tajweed",
    status: "coming-soon",
    pageCount: 16,
    learningPathIds: ["quran-recitation"],
    descriptionAr:
      "المنظومة الأهم في علم التجويد (107 أبيات)؛ تتناول مخارج الحروف وصفاتها وأحكام الراءات والترقيق والتفخيم والوقف والابتداء.",
  },
  {
    id: "al-durrah-al-mudiyyah",
    titleAr: "الدرة المضية في القراءات الثلاث المتممة للعشر",
    authorAr: "محمد بن الجزري",
    type: "tajweed",
    status: "coming-soon",
    pageCount: 24,
    learningPathIds: ["quran-recitation"],
    descriptionAr:
      "منظومة رائية تبين قراءات الأئمة الثلاثة (أبو جعفر، يعقوب، خلف العاشر) متممة للشاطبية مع مقارنة تفاعلية لأصول الروايات.",
  },
  {
    id: "al-shatibiyyah-usul",
    titleAr: "حرز الأماني ووجه التهاني (أصول الشاطبية)",
    authorAr: "القاسم بن فيرّه الشاطبي",
    type: "tajweed",
    status: "coming-soon",
    pageCount: 22,
    learningPathIds: ["quran-recitation"],
    descriptionAr:
      "قسم الأصول ورموز القراء السبعة ورواتهم في الشاطبية، مع أداة تفاعلية لفك وترجمة الرموز الحرفية والكلمية فورياً.",
  },
];
