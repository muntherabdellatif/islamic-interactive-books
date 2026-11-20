/** Builds the inner HTML for each panel section: tab bar, overview tab, rule tab, plain cards. */
const CardBuilders = (() => {
  function esc(s) {
    return String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  // Arabic labels for entities.json's internal document_section.metadata.kind values,
  // so the UI never leaks a raw English JSON key to the reader.
  const DOC_SECTION_KIND_AR = {
    title_page: "صفحة العنوان",
    duplicate_matn: "نسخة أخرى من المتن",
    tanbihat: "تنبيهات",
    bibliography: "المصادر والمراجع",
    ijaza: "سند الإجازة",
  };
  function docSectionKindLabel(kind) {
    return DOC_SECTION_KIND_AR[kind] || kind;
  }

  // Arabic labels for entities.json's internal person.metadata.role values.
  const PERSON_ROLE_AR = {
    author: "الناظم (المؤلف)",
    commentator: "الشارح",
    ijaza_chain: "في سند الإجازة",
  };
  function personRoleLabel(role) {
    return PERSON_ROLE_AR[role] || role;
  }

  // A simple metaphor icon per rule family, so a child recognizes the *kind* of rule at a glance.
  function ruleIcon(rule) {
    const id = rule.id;
    if (id.includes("idhar")) return "👁️";
    if (id.includes("idgham")) return "🔀";
    if (id.includes("iqlab")) return "🔁";
    if (id.includes("ikhfa")) return "🫥";
    if (id.includes("ghunnah")) return "🎵";
    if (id.includes("madd")) return "➰";
    if (id.includes("tashabuh") || id.includes("mathalayn") || id.includes("tajanus")) return "🧩";
    if (id.includes("lam-al") || id.includes("lam-fil")) return "🔡";
    return "📘";
  }

  function chapterHero(chapter) {
    const meta = chapter.metadata;
    return `<div class="chapter-hero" data-entity-id="${chapter.id}">
      <h2>${esc(chapter.label_ar)}</h2>
      <div class="range">الأبيات ${meta.bayt_range[0]}–${meta.bayt_range[1]}${
        meta.stated_count ? ` · المتن يذكر عددها: ${meta.stated_count}` : ""
      }</div>
    </div>`;
  }

  function tabBar(chapter, leafRules, activeTab, activeRuleId) {
    const ruleTabs = leafRules.map((r) => `<button class="panel-tab ${activeTab === "rule" && activeRuleId === r.id ? "active" : ""}"
      data-tab="rule" data-rule="${r.id}" style="--tab-color:${Data.categoryColor(r.metadata.category)}">
      ${ruleIcon(r)} ${esc(r.label_ar)}
    </button>`).join("");
    return `<div class="panel-tabs">
      <button class="panel-tab ${activeTab === "overview" ? "active" : ""}" data-tab="overview">🗂️ نظرة عامة</button>
      ${ruleTabs}
      <button class="panel-tab ${activeTab === "makhraj" ? "active" : ""}" data-tab="makhraj">🗺️ مخارج الحروف</button>
    </div>`;
  }

  function letterPickerHtml(chapter) {
    const partition = Data.letterPartitionForChapter(chapter);
    if (!partition) return "";
    // Iterate the letters actually present in this chapter's own letter_sets (data-driven,
    // not a hardcoded alphabet string — avoids mismatches like hamza ء vs plain alif ا).
    return `<div class="letter-picker">
      <p class="letter-picker-hint">اضغط أي حرف لترى أي حكم يُطبَّق عليه بعد هذا الباب:</p>
      <div class="letter-set">
        ${[...partition.entries()].map(([letter, ruleId]) => {
          const color = Data.categoryColor(Data.get(ruleId).metadata.category);
          return `<button class="letter-chip letter-chip-pick" style="border-color:${color}" data-pick-rule="${ruleId}">${esc(letter)}</button>`;
        }).join("")}
      </div>
    </div>`;
  }

  function overviewTab(chapter, leafRules) {
    const quiz = Data.quizFor(chapter.id);
    const chapterVideoHtml = videoSection(Data.chapterVideo(chapter.id));
    if (!leafRules.length) {
      // Chapters 1 (المقدمة) and 10 (الخاتمة) carry no tajweed rules of their own —
      // show the book's table of contents and its two "secret" numeric facts instead
      // of an empty "أحكام هذا الباب" section.
      return `${chapterHero(chapter)}${chapterVideoHtml}${bookIntroHtml()}`;
    }
    const ruleList = leafRules.map((r) => `<button class="rule-tree-item" data-pick-rule="${r.id}" style="--card-color:${Data.categoryColor(r.metadata.category)}">
      ${ruleIcon(r)} <span>${esc(r.label_ar)}</span>
    </button>`).join("");
    return `${chapterHero(chapter)}
      ${chapterVideoHtml}
      <div class="panel-section">
        <div class="panel-section-title">أحكام هذا الباب</div>
        <div class="rule-tree">${ruleList}</div>
      </div>
      ${letterPickerHtml(chapter)}
      ${baytCommentarySection(chapter)}
      <div class="panel-section">
        <button class="show-in-book-btn" data-show-chapter="${chapter.id}">📖 بيّن هذا الباب في الكتاب</button>
      </div>
      ${quiz.length ? quizSection(chapter, quiz) : ""}`;
  }

  // Plain-language explanation of what each bayt of this chapter actually SAYS (not a repeat
  // of its wording — that stays in the book pane — and not a repeat of the rule cards above,
  // which explain the tajweed rule itself; this answers "what is this line of poetry telling me?").
  function baytCommentarySection(chapter) {
    const bayts = Data.baytsOfChapter(chapter).filter((b) => Data.baytCommentary(b.id));
    if (!bayts.length) return "";
    return `<div class="panel-section">
      <div class="panel-section-title">📜 شرح أبيات هذا الباب (بيت بيت)</div>
      ${bayts.map((b) => `<div class="card bayt-commentary-card" data-entity-id="${b.id}">
        <div class="bayt-commentary-head">
          <span class="chip">بيت ${b.metadata.number}</span>
          <button class="show-in-book-btn" data-show-bayt="${b.id}">📖 بيّن في الكتاب</button>
        </div>
        <p class="bayt-commentary-text">${esc(Data.baytCommentary(b.id))}</p>
      </div>`).join("")}
    </div>`;
  }

  // Table of contents + the two jummal-count "secrets" (from existing definition entities,
  // not invented copy) — shown on the title page and on the intro/closing chapters, to
  // entice the reader into the rest of the book instead of leaving those pages empty.
  function bookIntroHtml() {
    const chapters = Data.allOfType("chapter").sort((a, b) => a.metadata.order - b.metadata.order);
    const secrets = ["definition.bayt-count-jummal", "definition.tarikh-tasnif-jummal"]
      .map(Data.get).filter(Boolean);
    return `<div class="panel-section">
      <div class="intro-card">
        <strong>تحفة الأطفال والغلمان</strong> منظومة من 61 بيتاً شعرياً، نظمها سليمان الجمزوري ليعلّم أحكام تجويد القرآن الكريم بطريقة ميسّرة سهلة الحفظ. كل باب يشرح حكماً أو مجموعة أحكام، بأمثلة وأحرف ورموز تساعد على تثبيتها.
      </div>
      <div class="panel-section-title">محتوى الكتاب</div>
      <div class="chapter-map">
        ${chapters.map((c) => `<button class="chapter-map-item" data-show-chapter="${c.id}">
          <span class="cm-order">${c.metadata.order}</span>
          <span>${esc(c.label_ar)} <span style="color:var(--text-muted);font-size:0.78rem">(الأبيات ${c.metadata.bayt_range[0]}-${c.metadata.bayt_range[1]})</span></span>
        </button>`).join("")}
      </div>
      ${secrets.length ? `<div class="panel-section-title">أسرار رقمية في المنظومة</div>
        ${secrets.map((s) => `<div class="secret-fact-card" data-toggle-secret>
          <strong>${esc(s.metadata.term)}</strong> 🔍
          <div class="reveal">${esc(s.metadata.definition_ar)}</div>
        </div>`).join("")}` : ""}
    </div>`;
  }

  // One curated YouTube lesson (chapter- or rule-level). Shown as a click-to-load thumbnail
  // (no iframe fetched until the reader actually wants to watch) + a direct "open on YouTube"
  // link, so the video can be watched either inline on this page or on youtube.com itself.
  function videoSection(video, titleHint) {
    if (!video || !video.youtube_id) return "";
    const id = esc(video.youtube_id);
    return `<div class="panel-section video-section">
      <div class="panel-section-title">🎬 فيديو شرح${titleHint ? `: ${esc(titleHint)}` : ""}</div>
      <div class="video-embed-box" data-video-embed="${id}">
        <img class="video-thumb" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="صورة مصغرة لفيديو الشرح" loading="lazy">
        <span class="video-play-badge">▶</span>
      </div>
      <div class="video-meta">
        <span class="video-source">${esc(video.title_ar || "")}${video.channel_ar ? ` — ${esc(video.channel_ar)}` : ""}</span>
        <a class="video-open-link" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">↗ فتح في يوتيوب</a>
      </div>
    </div>`;
  }

  function quizSection(chapter, items) {
    return `<div class="panel-section">
      <div class="panel-section-title">🧠 تطبيق سريع على باب «${esc(chapter.label_ar)}»</div>
      ${items.map((q, qi) => `
        <div class="card quiz-card" data-quiz-chapter="${chapter.id}" data-quiz-index="${qi}">
          <div class="quiz-question">${esc(q.question_ar)}</div>
          <div class="quiz-choices">
            ${q.choices_ar.map((c, ci) => `<button class="quiz-choice" data-choice="${ci}">${esc(c)}</button>`).join("")}
          </div>
          <div class="quiz-explanation">${esc(q.explanation_ar)}</div>
        </div>`).join("")}
    </div>`;
  }

  function letterChips(letterSets) {
    const letters = letterSets.flatMap((ls) => ls.metadata.letters);
    if (!letters.length) return "";
    return `<div class="letter-set">${letters.map((l) => `<span class="letter-chip">${esc(l)}</span>`).join("")}</div>`;
  }

  function mnemonicBox(mnemonics) {
    if (!mnemonics.length) return "";
    return mnemonics.map((m) => `<div class="mnemonic-box">
      <span class="chip">رمز</span> <span class="phrase">${esc(m.metadata.phrase)}</span>
      ${m.metadata.note_ar ? `<div style="margin-top:4px;color:var(--ink)">${esc(m.metadata.note_ar)}</div>` : ""}
    </div>`).join("");
  }

  // Matn examples (real entity ids, playable) + supplementary examples (interactive.json-only,
  // no entity id, so no play-button data-play key — handled by their own audio_url directly).
  function exampleRows(matnExamples, supplementary) {
    const matnRows = matnExamples.map((ex) => {
      const audio = Data.audioFor(ex.id);
      const isCounter = (ex.relations && ex.relations.counter_example_of && ex.relations.counter_example_of.length) > 0;
      const citation = audio ? `${audio.surah_name_ar} ${audio.surah}:${audio.ayah}` : "مثال من المتن";
      return `<div class="example-row">
        ${audio ? `<button class="play-btn" data-play="${ex.id}" title="استماع">▶</button>` : `<span class="play-btn" style="background:#555">–</span>`}
        <span class="word">${esc(ex.metadata.word)}</span>
        ${isCounter ? '<span class="chip badge-warning">استثناء</span>' : ""}
        <span class="citation">${citation}</span>
      </div>`;
    }).join("");
    // Supplementary examples with ayah_text_ar give the FULL verse, with the word/phrase that
    // demonstrates the rule distinguished inside it (not just the bare word on its own) — so a
    // reader sees the rule in real Qur'anic context, not an isolated flashcard word.
    const suppRows = (supplementary || []).map((ex, i) => {
      if (ex.ayah_text_ar) {
        const parts = ex.ayah_text_ar.split(ex.word);
        const ayahHtml = parts.map((p) => esc(p)).join(`<mark class="rule-hl">${esc(ex.word)}</mark>`);
        return `<div class="example-row example-row-full">
          <button class="play-btn" data-play-url="${esc(ex.audio_url)}" data-play-id="supp-${i}" title="استماع">▶</button>
          <div class="example-ayah-text">${ayahHtml}</div>
          <span class="citation">سورة ${esc(ex.surah_name_ar)} ${ex.surah}:${ex.ayah}${ex.letter ? ` — حرف ${esc(ex.letter_name_ar || ex.letter)}` : ""}</span>
        </div>`;
      }
      return `<div class="example-row">
        <button class="play-btn" data-play-url="${esc(ex.audio_url)}" data-play-id="supp-${i}" title="استماع">▶</button>
        <span class="word">${esc(ex.word)}</span>
        <span class="citation">${esc(ex.surah_name_ar)} ${ex.surah}:${ex.ayah}</span>
      </div>`;
    }).join("");
    if (!matnRows && !suppRows) {
      return `<p class="no-examples-note">لا تتوفر أمثلة صوتية إضافية موثّقة لهذا الحكم بعد.</p>`;
    }
    return matnRows + suppRows;
  }

  function ruleTab(rule, chapter) {
    const interactive = Data.ruleCard(rule.id) || {};
    const color = Data.categoryColor(rule.metadata.category);
    const letters = Data.relatedOfType(rule, "letter_set");
    const mnemonics = Data.relatedOfType(rule, "mnemonic");
    const matnExamples = Data.relatedOfType(rule, "example_word");
    const relatedBayts = Data.relatedOfType(rule, "bayt").sort((a, b) => a.metadata.number - b.metadata.number);
    const quoteBayt = relatedBayts[0];
    return `<div class="rule-detail" style="--card-color:${color}" data-entity-id="${rule.id}">
      <div class="rule-title">${ruleIcon(rule)} ${esc(rule.label_ar)}</div>
      <div class="rule-simplified">${esc(interactive.simplified_ar || "")}</div>

      ${videoSection(Data.ruleVideo(rule.id))}

      ${letters.length ? `<div class="panel-subsection-title">متى يُطبَّق؟</div>${letterChips(letters)}` : ""}

      <div class="panel-subsection-title">كيف يُنطق؟ من أين يخرج؟</div>
      ${MakhrajView.renderInline(interactive.makhraj_regions || [])}
      ${interactive.makhraj_note_ar ? `<p class="makhraj-note">${esc(interactive.makhraj_note_ar)}</p>` : ""}
      <button class="rule-card-actions-btn" data-makhraj="${rule.id}">🗺️ افتح الخريطة الكاملة للمخارج</button>

      ${mnemonics.length ? `<div class="panel-subsection-title">رمز يساعدك على الحفظ</div>${mnemonicBox(mnemonics)}` : ""}

      <div class="panel-subsection-title">أمثلة مسموعة</div>
      ${exampleRows(matnExamples, interactive.supplementary_examples)}

      ${quoteBayt ? `<div class="panel-subsection-title">من المتن</div>
        <div class="matn-quote-box">
          <span>${esc(quoteBayt.metadata.shatr1_text)}</span> — <span>${esc(quoteBayt.metadata.shatr2_text)}</span>
          <div style="margin-top:6px"><button class="show-in-book-btn" data-show-bayt="${quoteBayt.id}">📖 بيّن في الكتاب</button></div>
        </div>` : ""}
    </div>`;
  }

  function definitionCard(def) {
    return `<div class="card definition-card" style="--card-color:#8a7a1d" data-entity-id="${def.id}">
      <div class="term">${esc(def.metadata.term)}</div>
      <div>${esc(def.metadata.definition_ar)}</div>
    </div>`;
  }

  function personCard(person) {
    const initial = (person.metadata.name_ar || "?").trim()[0];
    return `<div class="card person-card" style="--card-color:#555" data-entity-id="${person.id}">
      <div class="person-avatar">${esc(initial)}</div>
      <div>
        <div style="font-weight:700">${esc(person.metadata.name_ar)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${esc(personRoleLabel(person.metadata.role))}${person.metadata.dates ? " · " + esc(person.metadata.dates) : ""}</div>
      </div>
    </div>`;
  }

  function documentSectionCard(doc) {
    return `<div class="card doc-section-card" style="--card-color:#999" data-entity-id="${doc.id}">
      <div class="kind">${esc(docSectionKindLabel(doc.metadata.kind))}</div>
      <div style="font-weight:700;margin:2px 0">${esc(doc.label_ar)}</div>
      <div style="font-size:0.88rem;color:var(--ink)">${esc(doc.metadata.summary_ar)}</div>
      ${doc.needs_review ? `<div class="chip badge-warning" style="margin-top:6px">${esc(doc.review_note || "بحاجة مراجعة")}</div>` : ""}
    </div>`;
  }

  return {
    chapterHero, tabBar, overviewTab, ruleTab, definitionCard, personCard, documentSectionCard,
    bookIntroHtml, ruleIcon, esc,
  };
})();
