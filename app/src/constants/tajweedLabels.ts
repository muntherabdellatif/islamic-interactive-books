/** Arabic labels for entities.json's internal document_section.metadata.kind values. */
export const DOC_SECTION_KIND_AR: Record<string, string> = {
  title_page: "صفحة العنوان",
  duplicate_matn: "نسخة أخرى من المتن",
  tanbihat: "تنبيهات",
  bibliography: "المصادر والمراجع",
  ijaza: "سند الإجازة",
};

/** Arabic labels for entities.json's internal person.metadata.role values. */
export const PERSON_ROLE_AR: Record<string, string> = {
  author: "الناظم (المؤلف)",
  commentator: "الشارح",
  ijaza_chain: "في سند الإجازة",
};

export const BOOK_INTRO_SECRET_IDS = [
  "definition.bayt-count-jummal",
  "definition.tarikh-tasnif-jummal",
] as const;
