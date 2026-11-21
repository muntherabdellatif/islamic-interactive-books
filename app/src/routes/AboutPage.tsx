import { AppShell } from "../components/layout/AppShell";
import { BOOK_TYPES } from "../constants/books";

export function AboutPage() {
  return (
    <AppShell>
      <div className="page-content">
      <section className="about-section">
        <h1>نبذة عن المنصة</h1>
        <p>
          منصة رقمية رائدة تهدف إلى إخراج التراث الإسلامي وكتب العلوم الشرعية من قوالب النصوص الجافة والخطية،
          وتحويلها إلى تجارب تفاعلية بصرية ذكية (شجيرات أسانيد، خرائط تفريغ فقهي، ومحاكاة بصرية للصوت والأداء)
          لتسهيل الفهم والبحث على الباحثين وطلبة العلم وعامة الجمهور.
        </p>
      </section>

      <section className="about-section">
        <h2>تجربة المستخدم</h2>
        <p>
          تعرض كل صفحة كتاب تفاعلي النص الأصلي أو صفحة الكتاب المطابقة للأصل على الجانب الأيسر، والجزء التفاعلي
          (شجرة الأسانيد، شجرة القرارات الفقهية، أو المحاكاة البصرية) على الجانب الأيمن، مع شريط علوي للتنقل بين
          الأقسام والكتب ومسارات التعلّم.
        </p>
      </section>

      <section className="about-section">
        <h2>تصنيفات الكتب</h2>
        <div className="about-type-grid">
          {BOOK_TYPES.map((type) => (
            <div key={type.id} className="about-type-card">
              <h3>{type.titleAr}</h3>
              <p>{type.interactiveIdeaAr}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>خط إنتاج تحويل الكتب</h2>
        <ol className="about-pipeline-list">
          <li>تقسيم الكتاب الضخم إلى حزم صغيرة لتسهيل المعالجة.</li>
          <li>مقارنة الصورة الأصلية بالنص المحوَّل إلى HTML ومراجعته واعتماده.</li>
          <li>استخراج الكيانات المهيكلة وتوليد معرفات فريدة تربطها بالنص الأصلي.</li>
          <li>مراجعة بشرية متخصصة لكل نوع كتاب حسب شكل بياناته.</li>
          <li>تحويل البيانات المعتمدة إلى واجهة تفاعلية نهائية للقارئ.</li>
        </ol>
      </section>
      </div>
    </AppShell>
  );
}
