---
name: vision-html-transcription
description: >-
  تحويل صور صفحات كتب التراث إلى نص HTML متطابق في المظهر والشكل الأصلي، مع وسوم دلالية ومحددات لمواقع الأسطر والفقرات.
---

# مهارة استخراج النصوص وتوليد قوالب الـ HTML المطابقة (Vision & HTML Layout Skill)

تهدف هذه المهارة إلى تحويل صورة الصفحة الأصلية إلى صفحة HTML خفيفة ونظيفة تُحاكي الصفحة المطبوعة شكلياً مع دقة تامة في رسم الحروف والتشكيل.

---

## 📐 مواصفات كود الـ HTML المطلوب

1. **الوسوم الدلالية (Semantic Markup):**
   * العناوين الكبرى: `<h1 class="chapter-title">` أو `<h2 class="section-title">`.
   * الفقرات العادية: `<p class="book-paragraph" data-page="12" data-line="3">`.
   * هوامش وتحقيقات المحقق: `<aside class="book-footnotes">`.
   * نصوص الأسانيد: `<div class="sanad-block">`.
   * المتون والشعر والمنظومات: `<div class="poem-bayt"><span class="shatr-1">...</span><span class="shatr-2">...</span></div>`.
2. **محاكاة التنسيق الأصلي (Layout Fidelity):**
   * محاذاة النص والمسافات البادئة كما في النسخة المطبوعة.
   * إدراج أرقام الصفحات الحقيقية للمطبوعة المعتمدة في ترويسة أو هامش الصفحة:
     `<div class="page-meta" data-printed-vol="1" data-printed-page="345">`.
3. **الجاهزية للربط الدلالي (Anchoring-Ready):**
   * إحاطة كل جملة أو وحدة معنى بوسم يسهل ربطه لاحقاً في المرحلة الثانية (`data-block-id`).

---

## 📝 القالب القياسي (HTML Template)

```html
<article class="manuscript-page" data-page="1026" dir="rtl" lang="ar">
  <header class="page-header">
    <span class="book-title">النشر في القراءات العشر</span>
    <span class="page-number">337</span>
  </header>

  <section class="page-body">
    <h2 class="heading-level-2">رواية خلف عن حمزة الكوفي</h2>
    <h3 class="heading-level-3">أولاً: طريق إدريس الحداد: طريق ابن عثمان</h3>
    
    <p class="isnad-text" data-line="5">
      بالسند المذكور ص 337 إلى الإمام أبي عمرو عثمان بن سعيد الداني...
    </p>
  </section>

  <footer class="page-footnotes">
    <ol>
      <li id="fn-1">(1) النشر: 1/ 337، والغاية: 1/ 215.</li>
    </ol>
  </footer>
</article>
```

---

## 📋 معايير الاعتماد في واجهة المراجعة:
1. مطابقة النص المنظّق بنسبة 100% للنص المطبوع في الصورة المقابلة.
2. عدم إغفال أي حاشية أو إشارة للمحقق.
3. اعتماد التشكيل الدقيق للأعلام والأسماء المبهمة وألفاظ الرواية.
