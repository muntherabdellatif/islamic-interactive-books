---
name: image-optimizer
description: >-
  تحسين وضغط صور صفحات الكتب التراثية وتحويلها إلى صيغة WebP عالية الدقة بحجم ملف صغير مناسب للويب والشاشات العريضة.
---

# مهارة تحسين وضغط صور صفحات الكتب (Image Optimizer Skill)

تتولى هذه المهارة إعداد الصور الممسوحة ضوئياً لكتب التراث بحيث تكون سريعة التحميل وبأعلى وضوح ممكن لقراءة الخطوط الدقيقة والشكل والتشكيل.

---

## 🎯 الأهداف والمعايير الفنية

* **الصيغة الإلزامية:** `WebP` (مع الحفاظ على شفافية وهوامش الصفحة إن وجدت).
* **الأبعاد المستهدفة:** عرض قياسي `1100px` إلى `1400px` (لضمان وضوح نصوص الحواشي والخطوط الأندلسية/المغربية/النسخ الدقيق).
* **معامل الجودة:** ما بين `80` إلى `85` (موازنة بين صفاء الحروف وصغر الحجم).
* **حجم الملف الأقصى المستهدف:** $\le 180\text{ KB}$ للصفحة الواحدة.

---

## 🛠️ سكربت المعالجة القياسي (Helper Script)

عند تشغيل تحويل أو ضغط دفعة صور، استخدم السكربت المساعد `scripts/optimize_images.py` أو قم بتنفيذ منطق المعالجة باستخدام مكتبة `Pillow`:

```python
from PIL import Image
import os

def optimize_to_webp(input_path: str, output_path: str, target_width: int = 1200, quality: int = 82) -> int:
    """
    تحويل الصورة إلى WebP مع الحفاظ على نسبة الأبعاد والوضوح.
    """
    with Image.open(input_path) as img:
        # الحفاظ على صيغة الألوان RGB
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # إعادة التحجيم النسبي
        w_percent = target_width / float(img.size[0])
        target_height = int(float(img.size[1]) * float(w_percent))
        resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # حفظ كـ WebP
        resized.save(output_path, "WEBP", quality=quality, method=6)
        return os.path.getsize(output_path)
```

---

## 📋 قائمة التحقق والاعتماد (Quality Checklist)

1. [ ] هل حجم الصورة الناتج أقل من 200 كيلوبايت؟
2. [ ] هل حركات التشكيل والحواشي السفلية واضحة ومقروءة دون تشويش (Artifacts)؟
3. [ ] هل تم تسمية الملف برقم الصفحة التسلسلي المتطابق مع الفهرس (`<page_number>.webp`)؟
