/**
 * Loads entities.json (stage 2) + interactive.json (stage 3 enrichment) and builds
 * lookup indices used by every other module. Pure data layer — no DOM here.
 */
const Data = (() => {
  let entities = [];
  let interactiveLayer = {};
  let byId = new Map();
  let graph = new Map(); // id -> Set(relatedId), built from every relations.* array, both directions.

  function flattenRelationIds(entity) {
    const ids = [];
    const rel = entity.relations || {};
    for (const key of Object.keys(rel)) {
      const value = rel[key];
      if (Array.isArray(value)) ids.push(...value);
    }
    return ids;
  }

  function buildGraph() {
    graph = new Map();
    const link = (a, b) => {
      if (!graph.has(a)) graph.set(a, new Set());
      graph.get(a).add(b);
    };
    for (const e of entities) {
      for (const otherId of flattenRelationIds(e)) {
        link(e.id, otherId);
        link(otherId, e.id);
      }
    }
  }

  async function load() {
    const [entitiesRes, interactiveRes] = await Promise.all([
      fetch(`${BOOK_DIR}/entities.json`, { cache: "no-store" }),
      fetch(`${BOOK_DIR}/interactive.json`, { cache: "no-store" }),
    ]);
    const entitiesJson = await entitiesRes.json();
    interactiveLayer = await interactiveRes.json();
    entities = entitiesJson.entities;
    byId = new Map(entities.map((e) => [e.id, e]));
    buildGraph();
  }

  function get(id) {
    return byId.get(id) || null;
  }

  function onPage(pageNum) {
    return entities.filter((e) => e.anchors.some((a) => a.page === pageNum));
  }

  function relatedOfType(entity, type) {
    const ids = graph.get(entity.id) || new Set();
    return [...ids].map(get).filter((e) => e && e.type === type);
  }

  function allOfType(type) {
    return entities.filter((e) => e.type === type);
  }

  function chapterForPage(pageNum) {
    return onPage(pageNum).find((e) => e.type === "chapter") || null;
  }

  // The chapter a bayt/rule belongs to, walking metadata.chapter_id or the parent chain.
  function chapterOf(entity) {
    if (!entity) return null;
    if (entity.type === "chapter") return entity;
    if (entity.metadata && entity.metadata.chapter_id) return get(entity.metadata.chapter_id);
    const parents = relatedOfType(entity, "chapter");
    if (parents.length) return parents[0];
    const ruleParents = (entity.relations && entity.relations.parent) || [];
    for (const pid of ruleParents) {
      const parent = get(pid);
      const found = chapterOf(parent);
      if (found) return found;
    }
    return null;
  }

  // A "leaf" rule is one nothing else refines further — these get their own tab.
  // Container rules (e.g. "الإدغام" over "بغنة"/"بغير غنة") become headers inside a tab instead.
  function isLeafRule(rule) {
    const children = (rule.relations && rule.relations.children) || [];
    return children.length === 0;
  }

  function leafRulesOfChapter(chapter) {
    return allOfType("tajweed_rule").filter((r) => {
      const c = chapterOf(r);
      return c && c.id === chapter.id && isLeafRule(r);
    });
  }

  function baytsOfChapter(chapter) {
    return allOfType("bayt")
      .filter((b) => { const c = chapterOf(b); return c && c.id === chapter.id; })
      .sort((a, b) => a.metadata.number - b.metadata.number);
  }

  function baytCommentary(baytId) {
    return (interactiveLayer.bayt_commentary || {})[baytId] || "";
  }

  // Curated YouTube lesson(s) for a whole chapter (shown in its overview tab) or for one
  // leaf rule specifically (shown in that rule's own tab) — each a list (sometimes a rule
  // needs two real videos, e.g. ikhfa's heavy- vs light-letter halves), from vetted real
  // channels teaching this exact book/subject, never auto-matched or invented.
  function chapterVideos(chapterId) {
    return (interactiveLayer.chapter_videos || {})[chapterId] || [];
  }
  function ruleVideos(ruleId) {
    return (interactiveLayer.rule_videos || {})[ruleId] || [];
  }

  // If a chapter's leaf rules' letter_sets exactly partition the 28-letter alphabet
  // (as validate_entities.py already proves for nun-sakinah/mim-sakinah/lam-al), build an
  // interactive "pick a letter" map; otherwise return null so the overview falls back to a plain list.
  function letterPartitionForChapter(chapter) {
    const rules = leafRulesOfChapter(chapter);
    const map = new Map();
    let total = 0;
    for (const rule of rules) {
      const letterSets = relatedOfType(rule, "letter_set");
      for (const ls of letterSets) {
        for (const letter of ls.metadata.letters) {
          if (map.has(letter)) return null; // overlap -> not a clean partition
          map.set(letter, rule.id);
          total += 1;
        }
      }
    }
    return total === 28 ? map : null;
  }

  function ruleCard(ruleId) {
    return (interactiveLayer.rules || {})[ruleId] || null;
  }

  function audioFor(exampleId) {
    return (interactiveLayer.examples_audio || {})[exampleId] || null;
  }

  function quizFor(chapterId) {
    return (interactiveLayer.quiz || {})[chapterId] || [];
  }

  function categoryColor(category) {
    return (interactiveLayer.category_colors || {})[category] || DEFAULT_CARD_COLOR;
  }

  function makhrajRegions() {
    return interactiveLayer.makhraj_regions || {};
  }

  // Lowest page in the annotated edition (pages 2-10) where this entity (or any of its
  // related bayts) is anchored — used by the panel's "بيّن في الكتاب" jump button.
  function firstAnnotatedPage(entity) {
    const bayts = entity.type === "bayt" ? [entity] : relatedOfType(entity, "bayt");
    const pages = bayts.flatMap((b) => b.anchors.map((a) => a.page)).filter((p) => p <= 10);
    return pages.length ? Math.min(...pages) : null;
  }

  // Every letter whose OWN place of articulation is this zone, from the explicit
  // letter_zones table (not derived from which rules happen to reference the zone —
  // a rule's region tells you where its *sound effect* (ghunnah, closure...) happens,
  // which is a different question from where each individual letter is articulated).
  function lettersForRegion(regionId) {
    const zones = interactiveLayer.letter_zones || {};
    return Object.keys(zones).filter((letter) => zones[letter] === regionId);
  }

  function khayshumLetters() {
    return interactiveLayer.khayshum_letters || [];
  }

  return {
    load, get, onPage, relatedOfType, allOfType, chapterForPage, chapterOf,
    isLeafRule, leafRulesOfChapter, letterPartitionForChapter, baytsOfChapter, baytCommentary,
    chapterVideos, ruleVideos,
    ruleCard, audioFor, quizFor, categoryColor, makhrajRegions, firstAnnotatedPage, lettersForRegion, khayshumLetters,
  };
})();
