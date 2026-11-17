---
name: entity-resolution
description: >-
  توحيد ومطابقة الكيانات والأسماء المترادفة والمختلفة في الصياغة (Entity Resolution) وحل الإبهام والتشابه بين الأعلام والأحكام عبر صفحات الكتاب.
---

# مهارة توحيد ومطابقة الكيانات (Entity Resolution & Disambiguation Skill)

تتولى هذه المهارة فحص جميع الكيانات المستخرجة في المرحلة الثانية لدمج المترادفات تحت "كيان معياري موحد" (Canonical Entity) والتمييز بين الأعلام المتشابهة في الاسم والمختلفة في الشخص.

---

## 🔍 التحديات التراثية التي تعالجها المهارة

1. **تعدد صِيَغ التسمية للشخص الواحد:**
   * *مثال:* "ابن الجزري" $\leftrightarrow$ "محمد بن محمد بن محمد الجزري" $\leftrightarrow$ "أبو الخير".
   * **الحل:** إنشاء كيان موحد يحمل `canonical_id` جامع، وربط جميع معرّفات الـ `UUIDs` السابقة به مع إسناد صفة الصيغة الفرعية (`alias`).
2. **التمييز بين المتشابهين في الاسم (Homonyms):**
   * *مثال:* "أحمد بن جعفر" (قد يكون أكثر من شخص في أزمنة مختلفة).
   * **الحل:** فحص طبقة الراوي، وشيوخه وتلاميذه، وسنة الوفاة للفصل الحاسم بينهما.

---

## 📊 نموذج الكيان الموحد (Canonical Registry Schema)

```typescript
export interface CanonicalEntity {
  canonical_id: string; // مثل: CANONICAL-NARRATOR-0042
  canonical_name: string; // الاسم الأكمل المعتمد
  aliases: string[]; // الصيغ البديلة الواردة في الكتاب
  linked_occurrence_uuids: string[]; // جميع الـ UUIDs المستخرجة من الصفحات
  type: 'narrator' | 'book_source' | 'fiqh_school';
  historical_data: {
    birth_year_hijri?: number;
    death_year_hijri?: number;
    generation_tabaqah?: number;
    city_origin?: string;
  };
}
```

---

## 🛠️ خطوات التنفيذ وسير العمل:

1. **التجميع الأولي (Clustering):** تجميع الأسماء باستخدام خوارزميات التشابه الصرفي واللفظي (Jaro-Winkler و Levenshtein) والنصوص المضمنة (Embeddings).
2. **التحكيم السياقي (Contextual Arbitration):** استخدام نموذج الذكاء الاصطناعي لمقارنة سياق السند أو المسألة قبل اقتراح الدمج.
3. **عرض المقترحات للمدقق البشري:** تقديم خيار (دمج / إبقاء منفصلين) في واجهة المراجعة للمرحلة الثالثة.
