---
name: interactive-builder
description: >-
  بناء وتوليد المكونات التفاعلية (Interactive Graphs, Decision Trees, Visual/Audio Simulations) من البيانات المهيكلة المعتمدة وربطها ثنائياً بواجهة القراءة.
---

# مهارة بناء وتوليد المكونات التفاعلية (Interactive Component Builder Skill)

تتولى هذه المهارة تحويل الكيانات الموحدة والعلاقات الناتجة عن المرحلتين 2 و 3 إلى مكونات بصرية تفاعلية جاهزة للعمل في الشطر الأيمن من واجهة المستخدم الثنائية (Split-Screen).

---

## 🎨 النماذج التفاعلية الأساسية (Component Archetypes)

### 1. شبكة الأسانيد (Isnad Graph Component)
* **المكتبات المقترحة:** `Cytoscape.js` أو `D3.js` أو `Sigma.js`.
* **هيكل البيانات (Graph Schema):**
  ```typescript
  export interface IsnadGraphPayload {
    nodes: Array<{
      id: string; // canonical_id للراوي
      label: string; // الاسم المختصر للعرض في العقدة
      tabaqah: number; // لتحديد المستوى الرأسي (المحور الصادي)
      isGoldenChain?: boolean;
    }>;
    edges: Array<{
      id: string;
      source: string; // الشيخ
      target: string; // الطالب
      transmission_term: string; // "قرأ على", "حدثنا"
      citation_page: number;
    }>;
  }
  ```

### 2. شجرة القرارات الفقهية (Fiqh Decision Tree)
* تفرع مرئي للمسائل:
  * الحالة الأولى $\rightarrow$ الشرط $\rightarrow$ الحكم $\rightarrow$ الأدلة وأقوال الأئمة.
  * كل خطوة تقود لتفريع مباشر مع زر "عرض في نص المتن الأصلي".

### 3. المحاكاة البصرية والتجويدية (Tajweed & Phonetics Simulator)
* رسم متجهي SVG تفاعلي لمخارج الحروف مع خريطة صوتية قابلة للتشغيل عند النقر على القاعدة.

---

## 🔄 التزامن الثنائي (Bidirectional Sync UX)

الشرط الأساسي في أي مكون تفاعلي يُبنى بهذه المهارة:
* **عند النقر على أي عقدة (Node / Step) في الجانب الأيمن:** يتحرك النص في الجانب الأيسر تلقائياً للتمرير إلى الفقرة المعنية (`scrollToAnchor`) ويُظلل الكيان بلون مضيء.
* **عند النقر على أي كلمة مظللة في النص الأيسر:** تُحدد العقدة المقابلة في الرسم التفاعلي الأيمن وتُقرّب الكاميرا نحوها (`focusNode`).
