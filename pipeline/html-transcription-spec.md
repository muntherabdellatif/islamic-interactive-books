# مواصفات المرحلة 1: تحويل صور الصفحات إلى HTML مطابق للشكل

هذا الملف هو المرجع الملزم لكل من ينسخ أو يراجع صفحات المرحلة الأولى (بشراً أو وكلاء ذكاء اصطناعي). يكمّل مهارة [vision-html-transcription](../skills/vision-html-transcription/SKILL.md) ويحدد قراراتها بدقة.

## المدخلات والمخرجات

| | المسار |
| :--- | :--- |
| صورة الصفحة | `data/books/al-nashr/images/<N>.webp` |
| ملف الـ HTML الناتج | `data/books/al-nashr/html/<N>.html` |
| تقرير مراجعة الحزمة | `pipeline/reviews/batch-XXX.md` |

* `N` هو رقم الصورة (1–985) ويُستخدم كقيمة `data-page`.
* المجلد والصفحة المطبوعة يُحسبان من [pages.json](../data/books/al-nashr/pages.json): الصور 1–510 = المجلد 1 (الصفحة = N)، الصور 511–985 = المجلد 2 (الصفحة = N − 510).
* الحزمة = 20 صورة: `batch-001` = 1–20، `batch-002` = 21–40، … `batch-050` = 981–985.

## أدوات مساعدة

```bash
# تقطيع الصفحة إلى شرائح أفقية متداخلة لقراءة الخط الدقيق
python3 pipeline/scripts/crop_page.py data/books/al-nashr/images/3.webp <output-dir>

# التحقق البنيوي من ملفات الـ HTML
python3 pipeline/scripts/validate_page_html.py data/books/al-nashr/html/1.html ...
```

## بنية الملف (جزء HTML وليس مستنداً كاملاً)

```html
<article class="manuscript-page" data-page="3" data-printed-vol="1" data-printed-page="3" dir="rtl" lang="ar">
  <header class="page-header">
    <span class="page-number">٣</span>
    <span class="running-title">فضل حملة القرآن</span>
  </header>
  <section class="page-body">
    <p class="book-paragraph" data-block-id="p0003-b01" data-continued="true">
      <span class="line" data-line="1">وأصحاب الليل » كذا رواه البيهقي فى شعب الإيمان وهو الصحيح وروينا</span>
      <span class="line" data-line="2">فيه عن ابن عباس أيضا قال قال رسول الله صلى الله عليه وسلم «ثلاثة لا يكترثون</span>
    </p>
    <h2 class="section-title" data-block-id="p0003-b02"><span class="line" data-line="3">باب ...</span></h2>
    <div class="poem-bayt" data-block-id="p0003-b03">
      <span class="line" data-line="4"><span class="shatr-1">...</span><span class="shatr-2">...</span></span>
    </div>
  </section>
  <footer class="page-footnotes">
    <p class="footnote" data-block-id="p0003-f01"><span class="line" data-line="5">(1) ...</span></p>
  </footer>
</article>
```

## القواعد

1. **سطر بسطر:** كل سطر مطبوع = `<span class="line" data-line="n">` واحد، بالترتيب نفسه. ترقيم `data-line` يبدأ من 1 في أول سطر بعد الترويسة ويستمر متسلسلاً حتى آخر سطر في الحواشي. الترويسة (رقم الصفحة والعنوان الجاري) لا تُرقّم.
2. **الكتل:** كل فقرة/عنوان/بيت/حاشية عنصر يحمل `data-block-id` فريداً بصيغة `p<NNNN>-b<NN>` (للمتن) و`p<NNNN>-f<NN>` (للحواشي)، حيث `NNNN` رقم الصورة بأربع خانات.
   * الفقرة الجديدة تُعرف بالمسافة البادئة في المطبوع.
   * `data-continued="true"` على أول كتلة إن كانت تكملة لكلام الصفحة السابقة، و`data-continues="true"` على آخر كتلة إن كان الكلام يكمل في الصفحة التالية.
3. **أنواع الكتل:** `h1.chapter-title` (عنوان كتاب/قسم كبير)، `h2.section-title` (عنوان باب أو فصل متوسط في السطر)، `p.book-paragraph` (نثر)، `div.sanad-block` (فقرة إسناد: سلسلة "أخبرنا/حدثنا/قرأت على ... عن ...")، `div.poem-bayt` مع `shatr-1`/`shatr-2` (الشعر والمنظومات؛ الشطر الأول هو الأيمن)، `p.footnote` داخل `footer.page-footnotes`.
4. **الأمانة الحرفية:** انسخ ما هو مطبوع حرفياً: الإملاء كما هو (فى/في، الهمزات، التاء المربوطة)، التشكيل حيث يوجد فقط، علامات الترقيم والأقواس كما هي (« » ( ) ﴿ ﴾ { })، الأرقام بالشكل المطبوع. لا تصحح ولا تكمل ولا تضف شيئاً غير موجود.
5. **عدم اليقين:** كلمة غير مؤكدة: `<span class="uncertain">الكلمة</span>`. موضع غير مقروء: `<span class="illegible">[…]</span>`. لا تخمّن بصمت.
6. **صفحة فارغة أو غلاف أو صورة بلا نص:** `<article ... data-blank="true">` مع `<section class="page-body"></section>` أو وصف قصير في `<p class="page-note" data-block-id="p<NNNN>-b01">`.
7. **توقيع الملزمة** (مثل `[م ٢ — ج ١]` أسفل الصفحة): سطر مرقّم داخل `<p class="page-note" data-block-id="p<NNNN>-bNN">`. الأقواس المزخرفة/الغليظة حول الكلمات المفتاحية مثل (قلت) تُكتب أقواساً عادية ( ). العلامات الهامشية العارضة (خطوط، بقع) لا تُنسخ.
8. **الفهارس والجداول:** كل سطر `span.line`؛ الأعمدة داخل السطر `<span class="col">`.

## المراجعة والاعتماد

* بعد النسخ: يُشغَّل المحقق البنيوي ويجب أن يمر دون أخطاء.
* المراجع (وكيل مستقل غير الناسخ) يقارن كل سطر بالصورة شريحة شريحة، ويصحح مباشرة في الملف، ثم يسجل في تقرير الحزمة لكل صفحة: عدد الأسطر، عدد التصحيحات، الكلمات غير المؤكدة، والحكم (`✅ معتمد` أو `⚠️ يحتاج مراجعة بشرية`).
* لا تُعتمد الصفحة إذا اختلف عدد أسطرها عن المطبوع أو بقي فيها سطر لم يُطابق.
* واجهة المقارنة جنباً إلى جنب: `review/index.html` (انظر التعليمات داخل الملف).
