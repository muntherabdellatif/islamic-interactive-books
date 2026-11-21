import type { MakhrajZone } from "../types/makhraj";

/**
 * The 3 throat sub-regions in interactive.json collapse into one friendly "الحلق" zone here —
 * kids don't need أقصى/وسط/أدنى الحلق up front; a rule tab can still name the exact one in its text.
 */
export const UI_ZONES: readonly MakhrajZone[] = [
  {
    id: "khayshum",
    label: "الأنف",
    sub: "الخيشوم",
    icon: "👃",
    color: "#60a5fa",
    tipAr: "جرّب: سدّ أنفك وقل «أنّ»... هل توقف الصوت؟ هذا هو مخرج الغنة.",
  },
  {
    id: "shafatan",
    label: "الشفتان",
    sub: "الشفتان",
    icon: "👄",
    color: "#f472b6",
    tipAr: "جرّب: قل «ب» أو «م»... شفتاك تنطبقان تماماً.",
  },
  {
    id: "lisan",
    label: "اللسان",
    sub: "اللسان",
    icon: "👅",
    color: "#34d399",
    tipAr: "جرّب: قل «ل» أو «ر»... طرف لسانك يلمس سقف فمك.",
  },
  {
    id: "jawf",
    label: "الفم الممتلئ بالهواء",
    sub: "الجوف",
    icon: "🫧",
    color: "#fbbf24",
    tipAr: "جرّب: قل «آ» ومدّها طويلاً... الهواء يمر بلا عائق، هذا مخرج حروف المد.",
  },
  {
    id: "halq",
    label: "الحلق",
    sub: "أقصى ووسط وأدنى الحلق",
    icon: "😮",
    color: "#a78bfa",
    tipAr: "جرّب: ضع يدك على حلقك وقل «ح» ثم «خ»... تشعر بصوت يخرج من الداخل.",
  },
];

export const HALQ_SUBS: readonly string[] = ["aqsa-halq", "wasat-halq", "adna-halq"];

/** Splits the one friendly "الحلق" zone into its 3 real sub-points, for an optional detail view. */
export const HALQ_DETAIL_ZONES: readonly MakhrajZone[] = [
  {
    id: "aqsa-halq",
    label: "أقصى الحلق",
    sub: "أقصى الحلق (الأقرب للصدر)",
    icon: "😮",
    color: "#8b7ae0",
    tipAr: "جرّب: ضع يدك أسفل حلقك قرب الصدر وقل «ء» ثم «هـ»... أبعد نقطة في الحلق.",
  },
  {
    id: "wasat-halq",
    label: "وسط الحلق",
    sub: "وسط الحلق",
    icon: "😯",
    color: "#a78bfa",
    tipAr: "جرّب: ضع يدك في منتصف حلقك وقل «ع» ثم «ح»... في المنتصف تماماً.",
  },
  {
    id: "adna-halq",
    label: "أدنى الحلق",
    sub: "أدنى الحلق (الأقرب للفم)",
    icon: "😧",
    color: "#c4b5fd",
    tipAr: "جرّب: ضع يدك أعلى حلقك قرب الفم وقل «غ» ثم «خ»... أقرب نقطة للفم.",
  },
];
