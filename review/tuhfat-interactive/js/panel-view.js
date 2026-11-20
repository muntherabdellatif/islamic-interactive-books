/**
 * Right pane: tab-based explanation of whatever the book is showing — never a repeat of the
 * matn text itself. Tabs are scoped to the current page's chapter (نظرة عامة + one tab per
 * leaf rule + مخارج الحروف) and persist while paging within that chapter.
 */
const PanelView = (() => {
  const container = document.getElementById("panel-pane");
  const state = { chapter: null, tab: "overview", ruleId: null, focusRegions: null };

  // The chapter of the page's FIRST printed bayt (by line order), not just "a chapter entity
  // anchored somewhere on this page" — a chapter's heading can land on the same page as the
  // previous chapter's closing bayts, which previously made the panel show the wrong chapter.
  function chapterForPageContent(pageNum, pageEntities) {
    const lineOf = (e) => (e.anchors.find((a) => a.page === pageNum) || {}).line ?? Infinity;
    const bayts = pageEntities.filter((e) => e.type === "bayt").sort((a, b) => lineOf(a) - lineOf(b));
    if (bayts.length) return Data.chapterOf(bayts[0]);
    const rules = pageEntities.filter((e) => e.type === "tajweed_rule").sort((a, b) => lineOf(a) - lineOf(b));
    if (rules.length) return Data.chapterOf(rules[0]);
    return Data.chapterForPage(pageNum);
  }

  function render(pageNum) {
    const pageEntities = Data.onPage(pageNum);
    const chapter = chapterForPageContent(pageNum, pageEntities);

    if (!chapter) {
      renderNonChapterPage(pageEntities);
      return;
    }

    if (!state.chapter || state.chapter.id !== chapter.id) {
      state.chapter = chapter;
      state.tab = "overview";
      state.ruleId = null;
    }
    renderChapterPanel();
  }

  function renderChapterPanel() {
    const chapter = state.chapter;
    const leafRules = Data.leafRulesOfChapter(chapter);
    let body = "";
    if (state.tab === "overview") {
      body = CardBuilders.overviewTab(chapter, leafRules);
    } else if (state.tab === "rule" && state.ruleId) {
      body = CardBuilders.ruleTab(Data.get(state.ruleId), chapter);
    } else if (state.tab === "makhraj") {
      body = MakhrajView.render(state.focusRegions);
    }
    container.innerHTML = CardBuilders.tabBar(chapter, leafRules, state.tab, state.ruleId) + `<div class="panel-tab-body">${body}</div>`;
    wireInteractions();
    if (state.tab === "makhraj") MakhrajView.wire(container);
  }

  function renderNonChapterPage(pageEntities) {
    const persons = pageEntities.filter((e) => e.type === "person");
    const docSections = pageEntities.filter((e) => e.type === "document_section");
    const isTitlePage = docSections.some((d) => d.metadata.kind === "title_page");
    let html = isTitlePage ? CardBuilders.bookIntroHtml() : "";
    if (persons.length) {
      html += `<div class="panel-section"><div class="panel-section-title">أعلام</div>`;
      html += persons.map(CardBuilders.personCard).join("");
      html += `</div>`;
    }
    if (docSections.length) {
      html += `<div class="panel-section"><div class="panel-section-title">محتوى هذا القسم</div>`;
      html += docSections.map(CardBuilders.documentSectionCard).join("");
      html += `</div>`;
    }
    container.innerHTML = html || `<div class="empty-panel-note">لا توجد كيانات مفهرسة على هذه الصفحة بعد.</div>`;
    wireInteractions();
  }

  function selectRule(ruleId) {
    state.tab = "rule";
    state.ruleId = ruleId;
    renderChapterPanel();
  }

  function openMakhraj(regionIds) {
    state.tab = "makhraj";
    state.focusRegions = regionIds;
    renderChapterPanel();
  }

  function wireInteractions() {
    container.querySelectorAll(".panel-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.tab === "rule") selectRule(btn.dataset.rule);
        else { state.tab = btn.dataset.tab; renderChapterPanel(); }
      });
    });

    container.querySelectorAll("[data-pick-rule]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        selectRule(btn.dataset.pickRule);
      });
    });

    container.querySelectorAll("[data-makhraj]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const rule = Data.get(btn.dataset.makhraj);
        openMakhraj((Data.ruleCard(rule.id) || {}).makhraj_regions || []);
      });
    });

    container.querySelectorAll("[data-show-bayt]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const bayt = Data.get(btn.dataset.showBayt);
        const page = Data.firstAnnotatedPage(bayt);
        if (page) App.goToPage(page).then(() => Sync.select(bayt.id));
      });
    });

    container.querySelectorAll("[data-show-chapter]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const chapter = Data.get(btn.dataset.showChapter);
        const page = chapter.anchors.find((a) => a.page <= 10).page;
        App.goToPage(page);
      });
    });

    container.querySelectorAll("[data-toggle-secret]").forEach((card) => {
      card.addEventListener("click", () => card.classList.toggle("open"));
    });

    // Click-to-load video embed: nothing is fetched from YouTube until the reader actually
    // clicks the thumbnail, and only then do we build the iframe (youtube-nocookie.com, the
    // privacy-enhanced embed domain) in its place.
    container.querySelectorAll("[data-video-embed]").forEach((box) => {
      box.addEventListener("click", () => {
        const id = box.dataset.videoEmbed;
        box.outerHTML = `<div class="video-embed-box video-embed-live">
          <iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1"
            title="فيديو شرح" frameborder="0" loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>`;
      });
    });

    container.querySelectorAll("[data-play]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        AudioView.playFor(btn.dataset.play, btn);
      });
    });
    container.querySelectorAll("[data-play-url]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        AudioView.playUrl(btn.dataset.playUrl, btn.dataset.playId, btn);
      });
    });

    container.querySelectorAll(".quiz-choice").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const card = btn.closest(".quiz-card");
        const chapterId = card.dataset.quizChapter;
        const qi = Number(card.dataset.quizIndex);
        const item = Data.quizFor(chapterId)[qi];
        const chosen = Number(btn.dataset.choice);
        card.querySelectorAll(".quiz-choice").forEach((b, i) => {
          b.disabled = true;
          if (i === item.answer_index) b.classList.add("correct");
          else if (i === chosen) b.classList.add("wrong");
        });
        card.querySelector(".quiz-explanation").classList.add("shown");
      });
    });
  }

  function highlightSelected(id) {
    container.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
    const el = container.querySelector(`[data-entity-id="${id}"]`);
    if (el) {
      el.classList.add("selected");
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // The clicked entity belongs to a tab that isn't open yet — switch to the right one.
      const entity = Data.get(id);
      if (entity && entity.type === "bayt") {
        const rules = Data.relatedOfType(entity, "tajweed_rule").filter(Data.isLeafRule);
        if (rules.length) {
          selectRule(rules[0].id);
        } else {
          // An intro/summary bayt (e.g. "النون الساكنة لها أربع أحكام") names no single rule —
          // show the chapter's rule list instead of doing nothing.
          state.tab = "overview";
          renderChapterPanel();
        }
      }
    }
  }

  return { render, highlightSelected };
})();
