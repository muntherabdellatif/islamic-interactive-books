import type { BookSummary } from "../../types/book";

export const FIQH_BOOKS: readonly BookSummary[] = [
  {
    id: "matn-abi-shuja",
    titleAr: "متن أبي شجاع (الغاية والتقريب)",
    authorAr: "أحمد بن الحسين الأصفهاني (أبو شجاع)",
    type: "fiqh",
    status: "coming-soon",
    pageCount: 177,
    learningPathIds: ["comparative-fiqh"],
    descriptionAr:
      "المتن التأسيسي في الفقه الشافعي، يُعرض عبر شجرة قرارات فقهية تتفرع بحسب الشروط والأركان والمبطلات مع الأدلة.",
  },
  {
    id: "umdat-al-fiqh",
    titleAr: "عمدة الفقه (على مذهب الإمام أحمد)",
    authorAr: "موفق الدين ابن قدامة المقدسي",
    type: "fiqh",
    status: "coming-soon",
    pageCount: 176,
    learningPathIds: ["comparative-fiqh"],
    descriptionAr:
      "متن فقهي محرّر على قول واحد معتمد في المذهب الحنبلي، يغطي العبادات والمعاملات بشجرة أحكام متدرجة.",
  },
  {
    id: "al-murshid-al-muin",
    titleAr: "المرشد المعين على الضروري من علوم الدين",
    authorAr: "عبد الواحد بن عاشر الفاسي",
    type: "fiqh",
    status: "coming-soon",
    pageCount: 32,
    learningPathIds: ["comparative-fiqh"],
    descriptionAr:
      "منظومة جامعة للأحكام الفقهية على مذهب الإمام مالك (الطهارة، الصلاة، الصيام، الزكاة، الحج) بمخططات بصرية إرشادية.",
  },
  {
    id: "mukhtasar-al-quduri",
    titleAr: "مختصر القدوري (الكتاب)",
    authorAr: "أبو الحسين أحمد بن محمد القدوري",
    type: "fiqh",
    status: "coming-soon",
    pageCount: 255,
    learningPathIds: ["comparative-fiqh"],
    descriptionAr:
      "متن الفقه الحنفي المعتمد؛ يفرّع مسائل ظاهر الرواية وأدلتها الشرعية مع معجم للمصطلحات الفقهية الحنفية.",
  },
  {
    id: "al-rahbiyyah",
    titleAr: "الرحبية في علم الفرائض (بغية الباحث)",
    authorAr: "محمد بن علي الرحبي",
    type: "faraid",
    status: "coming-soon",
    pageCount: 9,
    learningPathIds: ["inheritance-math"],
    descriptionAr:
      "منظومة الفرائض والمواريث (175 بيتاً)؛ مربوطة بحاسبة مواريث تفاعلية توزع التركات وتبين استحقاق كل وارث وسنده من المنظومة.",
  },
];
