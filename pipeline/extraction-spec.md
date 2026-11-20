# مواصفات المرحلة 2: استخراج الكيانات والربط (tuhfat-al-atfal)

مرجع ملزم لاستخراج بيانات مهيكلة من HTML المرحلة 1 (`data/books/<BOOK>/html/`) دون تعديله، وربطها به عبر "ربط مستقل" (standoff anchors) بدل تضمين `data-entity-id` داخل ملفات HTML المعتمدة.

## القرار المعماري: لا تُعدَّل ملفات HTML المرحلة 1

بدل الاقتراح الأصلي في `skills/entity-extraction-linking/SKILL.md` (تغليف النص بـ `<span data-entity-id>`)، كل كيان يحمل مصفوفة `anchors` تشير إلى موضعه بدقة عبر `(page, block_id, line, quote)`. السبب: صفحات tuhfat-al-atfal معتمدة ونهائية (29/29)، وتعديلها يكسر المراجعة البشرية المنجزة. عارض المراجعة (`review/entities.html`) يحسب التظليل وقت العرض، ولا يُغيّر الملف الأصلي. إن احتاج التطبيق التفاعلي النهائي (المرحلة 4) وسوماً داخل HTML، تُولَّد نسخة مشتقة لاحقاً من هذه البيانات، لا تُكتب فوق المرحلة 1.

## الملف الناتج

`data/books/tuhfat-al-atfal/entities.json` — ملف واحد لكل الكتاب (29 صفحة، كتاب صغير):

```json
{
  "book": "tuhfat-al-atfal",
  "stage": 2,
  "generated_at": "YYYY-MM-DD",
  "entities": [ /* ExtractedEntity[] */ ]
}
```

## نموذج الكيان (ExtractedEntity)

```ts
interface Anchor {
  page: number;        // data-page
  block_id: string;    // data-block-id كما هو في HTML
  line?: number;       // data-line (اختياري إن كان الكيان يغطي الكتلة كلها)
  shatr?: 'shatr-1' | 'shatr-2'; // إن كان الاستشهاد داخل شطر واحد
  quote?: string;      // نص حرفي (بلا وسوم) يجب أن يكون موجوداً طبق الأصل في السطر/الكتلة المشار إليها؛ يُحذف إن كان الكيان يغطي الكتلة/السطر كاملاً (مثل bayt، chapter)
  occurrence?: number; // رقم التكرار (1-based) إن تكرر quote في نفس السطر؛ افتراضياً 1
}

interface ExtractedEntity {
  id: string;           // slug مقروء هرمي، لا UUID (انظر "تسمية المعرفات")
  type:
    | 'chapter' | 'bayt' | 'tajweed_rule' | 'letter_set' | 'mnemonic'
    | 'example_word' | 'definition' | 'footnote' | 'person' | 'document_section';
  label_ar: string;      // عنوان قصير للعرض
  anchors: Anchor[];     // موضع واحد أو أكثر (قد يتكرر الكيان عبر صفحات، مثل أبيات 12-15)
  metadata: Record<string, unknown>; // حقول خاصة بالنوع، انظر أسفله
  relations?: Record<string, string[]>; // أسماء علاقات → مصفوفة ids. مفردتان ثابتتان للتسلسل الهرمي بين rule/chapter: `parent` (أب واحد) و`children` (مشتقة، يجب أن تطابق عدد `metadata.stated_count` إن وُجد). كل علاقة من `bayt` نحو حكم/تعريف/باب تُسمّى `topic` حصراً (وليس `parent`، لأن البيت لا "يرث" من الحكم). علاقات أخرى حرة التسمية (applies_to_letters, example_of, mnemonic_for, exceptions, counter_example_of...).
  needs_review?: boolean;
  review_note?: string; // سبب العلم عند needs_review=true
}
```

### حقول `metadata` بحسب النوع

* **chapter**: `{ order, bayt_count_marker, bayt_range: [first,last] }`
* **bayt**: `{ number, shatr1_text, shatr2_text, chapter_id }`
* **tajweed_rule**: `{ category, description_ar, stated_count? }` — الحروف والأمثلة تُربط عبر `relations.applies_to_letters` و `relations.examples`، لا تُكرَّر كنص هنا. `stated_count` يُضاف فقط عندما يذكر المتن صراحة عدد الأقسام (مثل «أربع أحكام»، «حالان»، «ثلاثة»)؛ عندئذٍ يجب أن يساوي طول `relations.children`.
* **letter_set**: `{ letters: string[], count }` — يجب أن يطابق `letters.length` قيمة `count` (يتحقق منه المدقق).
* **mnemonic**: `{ phrase, decode_method: 'all_letters' | 'first_letter_of_word' | 'contains_letters' | 'all_letters_except_alif', decoded_letters: string[] }` — يتحقق منه المدقق آلياً بحسب الطريقة. `all_letters_except_alif` حالة خاصة موثّقة (فواتح السور، بيت ٥٥ «لا ألف»)، وليست قاعدة عامة تُطبَّق بصمت.
* **example_word**: `{ word, source: 'quran' | 'generic', surah_ayah: string | null }`
* **definition**: `{ term, definition_ar }`
* **footnote**: نفس `block_id` الخاص به في HTML يُستعمل كـ `id` (مثل `p0005-f01`). `{ marker, kind: 'meter'|'iraab'|'qiraat'|'pronunciation'|'biography'|'other' }`
* **person**: `{ name_ar, role: 'author'|'commentator'|'ijaza_chain', dates }`
* **document_section**: فئة خفيفة (الفئة الثانية أسفله) `{ kind: 'title_page'|'duplicate_matn'|'ijaza'|'tanbihat'|'bibliography', summary_ar }`

## تسمية المعرفات

Slugs مقروءة هرمية بالإنجليزية الحرفية (transliteration)، لا UUID: `chapter.nun-sakinah-tanwin`, `rule.nun-sakinah-tanwin.ikhfa`, `letters.ikhfa-nun`, `mnemonic.ikhfa-nun`, `bayt.042`. السبب: العلاقات بين الكيانات (`relations`) تُقرأ بشرياً في المراجعة، وUUID يعيق ذلك. **هذا تحويل متعمد عن النموذج العام في SKILL.md** (الذي يطلب UUID v4) — مُسجَّل هنا كاستثناء موثّق لهذا الكتاب.

## مستويان من العمق (Tiering)

* **الفئة الأولى (استخراج كامل):** الصفحات 2–10، المتن الكامل بأبياته الـ 61 وشرحه (10 أبواب). هنا تُستخرج كل الأنواع: `chapter`, `bayt`, `tajweed_rule`, `letter_set`, `mnemonic`, `example_word`, `definition`. هذا هو جوهر الرؤية التفاعلية (مخارج الحروف، تلوين الكلمات بحسب الحكم) من `about.md`.
* **الفئة الثانية (فهرسة خفيفة):** الصفحة 1 (غلاف) والصفحات 11–29 (إعادة طبع المتن نظيفاً، إجازة ونسب الإسناد، تنبيهات، مصادر). تُفهرس كـ `document_section` واحد أو أكثر لكل قسم، مع كيانات `person` للأسماء الواردة في سلسلة الإجازة (صفحات 16-24). **لا استخراج حكم تجويدي تفصيلي هنا** — أبيات صفحات 12–15 تُضاف كـ anchors إضافية على كيانات `bayt` الموجودة من الفئة الأولى (نفس الأبيات، طبعة ثانية)، لا تُكرَّر كيانات جديدة.

## الحواشي (footnotes) وتنبيه المطابقة

ليس كل حاشية `(ن)` ملاصقة لكلمة في المتن تتحدث عنها بالضرورة — رقم الحاشية يُحدَّد بترتيب الطبع لا بالضرورة بجوار الموضوع. عند استخراج حاشية، اربطها بموضوعها الحقيقي من محتواها، وإن تعارض موضع الرقم المطبوع مع محتوى الحاشية فعلّم `needs_review: true` مع `review_note` (لا تُعِد الترقيم بصمت).

## المدقق البرمجي

`pipeline/scripts/validate_entities.py --book tuhfat-al-atfal`:
1. كل `id` فريد؛ كل معرف يظهر في `relations.*` أو `metadata.chapter_id` موجود فعلاً كـ entity.
2. كل `anchor.quote` نص فرعي حرفي (بعد إزالة الوسوم) من نص `block_id`/`line` المطابق في `data/books/tuhfat-al-atfal/html/<page>.html`؛ وإن تكرر `quote` في نفس السطر أكثر من مرة ولم يحدَّد `occurrence` بوضوح → خطأ.
3. لكل `letter_set`: `metadata.letters.length === metadata.count`.
4. لكل `mnemonic`: أول حرف من كل كلمة في `metadata.phrase` (بعد إزالة التشكيل) يطابق `metadata.decoded_letters` بالترتيب.
5. لكل `chapter`: عدد الأبيات في `bayt_range` يطابق `bayt_count_marker` المطبوع (الرقم بين `[ ]`).
6. **محتوى الموضع لا موضعه فقط:** سطر anchor الخاص بـ `bayt` يجب أن يحتوي رقمه المطبوع متبوعاً بـ`)` (بالأرقام الهندية)؛ وسطر anchor الخاص بـ `chapter` يجب أن يبدأ برقم ترتيبه متبوعاً بـ`-`. هذا يمنع ربط كيان بموضع صفحة خاطئ (حدث فعلاً مرة أثناء الاستخراج الأول: ربط باب بعنوان باب آخر).
7. **تقسيم الحروف الـ28:** مجموعات حروف كل حكم جامع (أحكام النون الساكنة، أحكام الميم الساكنة، لام أل) يجب أن تُغطي الأبجدية الـ28 بالضبط بلا تداخل ولا نقص (الهمزة ء والألف ا يُعاملان كخانة أبجدية واحدة). هذا بديل عملي عن توحيد الكيانات (المرحلة 3) لهذا الكتاب تحديداً — انظر `pipeline/status.md`.

## تحذير: لا تُضِف معرفة خارج المتن

ممنوع إضافة بيانات (رقم آية، عدد حركات، مثال لفظي) لم يذكرها المتن أو حواشيه صراحة، حتى لو كانت صحيحة معرفياً (مثل تحديد سورة/آية لكلمة قرآنية ورد ذكرها دون إحالة). ضع `null` بدل التخمين، أو انقلها لحقل `enrichment` منفصل موسوم `provenance: "editor"` إن احتُجت لاحقاً لواجهة تفاعلية تستدعي مصدراً خارجياً (مثل محرك نص قرآني).

## واجهة المراجعة

`review/entities.html?page=N` (نفس خادم `review/index.html`): يعرض نص الصفحة من `data/books/tuhfat-al-atfal/html/<N>.html` مع تظليل كل كيان بلون بحسب `type` (محسوب وقت العرض من `anchors`، لا تعديل على HTML)، ولوحة جانبية بشجرة JSON للكيان المحدد، مع تنقل بين الصفحات وعرض شجرة الأبواب/الأحكام الكاملة للكتاب.
