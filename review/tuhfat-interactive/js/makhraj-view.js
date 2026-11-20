/**
 * The "مخارج الحروف" tab: a rotatable 3D head/neck diagram (see makhraj-3d.js) as the main
 * visual, friendly for children, with a slim zone-selector row beneath it for accessibility
 * and as a fallback when WebGL isn't available. A rule tab can ask this view to pre-highlight
 * the zone(s) that rule's sound comes from.
 */
const MakhrajView = (() => {
  // The 3 throat sub-regions in interactive.json collapse into one friendly "الحلق" zone here —
  // kids don't need أقصى/وسط/أدنى الحلق up front; a rule tab can still name the exact one in its text.
  const UI_ZONES = [
    { id: "khayshum", label: "الأنف", sub: "الخيشوم", icon: "👃", color: "#60a5fa",
      tip_ar: "جرّب: سدّ أنفك وقل «أنّ»... هل توقف الصوت؟ هذا هو مخرج الغنة." },
    { id: "shafatan", label: "الشفتان", sub: "الشفتان", icon: "👄", color: "#f472b6",
      tip_ar: "جرّب: قل «ب» أو «م»... شفتاك تنطبقان تماماً." },
    { id: "lisan", label: "اللسان", sub: "اللسان", icon: "👅", color: "#34d399",
      tip_ar: "جرّب: قل «ل» أو «ر»... طرف لسانك يلمس سقف فمك." },
    { id: "jawf", label: "الفم الممتلئ بالهواء", sub: "الجوف", icon: "🫧", color: "#fbbf24",
      tip_ar: "جرّب: قل «آ» ومدّها طويلاً... الهواء يمر بلا عائق، هذا مخرج حروف المد." },
    { id: "halq", label: "الحلق", sub: "أقصى ووسط وأدنى الحلق", icon: "😮", color: "#a78bfa",
      tip_ar: "جرّب: ضع يدك على حلقك وقل «ح» ثم «خ»... تشعر بصوت يخرج من الداخل." },
  ];
  const HALQ_SUBS = ["aqsa-halq", "wasat-halq", "adna-halq"];

  // Optional "scientific" detail: splits the one friendly "الحلق" zone into its 3 real
  // sub-points (data already exists in interactive.json's makhraj_regions, just not shown
  // by default). Lets a parent or older learner see the Ibn al-Jazari-style breakdown
  // (5 general areas / 17 points) without forcing it on a first-time child reader.
  const HALQ_DETAIL_ZONES = [
    { id: "aqsa-halq", label: "أقصى الحلق", sub: "أقصى الحلق (الأقرب للصدر)", icon: "😮", color: "#8b7ae0",
      tip_ar: "جرّب: ضع يدك أسفل حلقك قرب الصدر وقل «ء» ثم «هـ»... أبعد نقطة في الحلق." },
    { id: "wasat-halq", label: "وسط الحلق", sub: "وسط الحلق", icon: "😯", color: "#a78bfa",
      tip_ar: "جرّب: ضع يدك في منتصف حلقك وقل «ع» ثم «ح»... في المنتصف تماماً." },
    { id: "adna-halq", label: "أدنى الحلق", sub: "أدنى الحلق (الأقرب للفم)", icon: "😧", color: "#c4b5fd",
      tip_ar: "جرّب: ضع يدك أعلى حلقك قرب الفم وقل «غ» ثم «خ»... أقرب نقطة للفم." },
  ];

  let detailed = false;
  let instance3d = null;

  function uiZoneForDataRegion(regionId) {
    return HALQ_SUBS.includes(regionId) ? "halq" : regionId;
  }

  function lettersForUiZone(zoneId) {
    if (zoneId === "halq") {
      const set = new Set(HALQ_SUBS.flatMap((r) => Data.lettersForRegion(r)));
      return [...set];
    }
    // الخيشوم isn't a primary place of articulation for any letter — ن/م are articulated
    // elsewhere (lisan/shafatan) and simply carry a nasal hum (غنة) through it.
    if (zoneId === "khayshum") return Data.khayshumLetters();
    return Data.lettersForRegion(zoneId);
  }

  function dataRegionsToUiZones(regionIds) {
    return [...new Set((regionIds || []).map(uiZoneForDataRegion))];
  }

  function visibleZones() {
    if (!detailed) return UI_ZONES;
    const halqIdx = UI_ZONES.findIndex((z) => z.id === "halq");
    return [...UI_ZONES.slice(0, halqIdx), ...HALQ_DETAIL_ZONES, ...UI_ZONES.slice(halqIdx + 1)];
  }

  function hexNum(c) {
    return parseInt(String(c).replace("#", ""), 16);
  }

  function colorMapFor(zones) {
    const map = {};
    zones.forEach((z) => (map[z.id] = hexNum(z.color)));
    return map;
  }

  function zoneBlob(zone, active) {
    return `<button class="mk-zone ${active ? "active" : ""}" data-zone="${zone.id}" style="--zone-color:${zone.color}">
      <span class="mk-zone-icon">${zone.icon}</span>
      <span class="mk-zone-label">${esc(zone.label)}</span>
    </button>`;
  }

  function zoneDetailHtml(zoneId) {
    const zone = UI_ZONES.find((z) => z.id === zoneId) || HALQ_DETAIL_ZONES.find((z) => z.id === zoneId);
    if (!zone) return "";
    const letters = HALQ_SUBS.includes(zoneId) ? Data.lettersForRegion(zoneId) : lettersForUiZone(zoneId);
    const label = zone.sub || zone.label;
    return `<div class="mk-detail-card" style="--zone-color:${zone.color}">
      <div class="mk-detail-title">${zone.icon} ${esc(label)}</div>
      <div class="letter-set">${letters.map((l) => `<span class="letter-chip" style="border-color:${zone.color}">${esc(l)}</span>`).join("")}</div>
      <p class="makhraj-note">${esc(zone.tip_ar)}</p>
    </div>`;
  }

  function esc(s) {
    return String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function render(focusRegions) {
    const focusZones = dataRegionsToUiZones(focusRegions);
    let defaultZone = focusZones[0] || null;
    if (detailed && defaultZone === "halq") {
      defaultZone = (focusRegions || []).find((r) => HALQ_SUBS.includes(r)) || HALQ_DETAIL_ZONES[0].id;
    }
    return `<div class="panel-section">
      <div class="panel-section-title">🗺️ خريطة مخارج الحروف</div>
      <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:10px">
        دوِّر المجسّم بإصبعك أو بالماوس لترى الرأس والرقبة من كل جانب، أو اضغط على منطقة (في المجسّم أو في القائمة) لترى حروفها.
      </p>
      <div class="mk-3d-mount" id="mk-3d-mount" data-default-zone="${defaultZone || ""}"></div>
      <button class="mk-detail-toggle" data-mk-toggle>
        ${detailed ? "👶 عرض مبسّط (5 مناطق)" : "🔬 عرض علمي تفصيلي (أقصى/وسط/أدنى الحلق)"}
      </button>
      <div class="mk-zones" id="mk-zone-row">
        ${visibleZones().map((z) => zoneBlob(z, z.id === defaultZone)).join("")}
      </div>
      <div id="mk-detail">${defaultZone ? zoneDetailHtml(defaultZone) : ""}</div>
    </div>`;
  }

  // A compact, always-visible version embedded directly inside a rule tab (no extra click
  // needed to see "these letters come from here") — the dedicated مخارج الحروف tab (with the
  // 3D model) stays reachable via the button this returns alongside.
  function renderInline(regionIds) {
    const uiZones = dataRegionsToUiZones(regionIds);
    if (!uiZones.length) return "";
    return `<div class="mk-inline-group">
      ${uiZones.map((zoneId) => {
        const zone = UI_ZONES.find((z) => z.id === zoneId);
        if (!zone) return "";
        const letters = lettersForUiZone(zoneId);
        return `<div class="mk-inline" style="--zone-color:${zone.color}">
          <span class="mk-inline-icon">${zone.icon}</span>
          <div class="mk-inline-body">
            <strong>${esc(zone.sub)}</strong>
            <div class="letter-set">${letters.map((l) => `<span class="letter-chip" style="border-color:${zone.color}">${esc(l)}</span>`).join("")}</div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
  }

  function selectZone(container, zoneId, sync3d) {
    container.querySelectorAll(".mk-zone").forEach((b) => b.classList.toggle("active", b.dataset.zone === zoneId));
    const detail = container.querySelector("#mk-detail");
    if (detail) detail.innerHTML = zoneDetailHtml(zoneId);
    if (sync3d !== false && instance3d) instance3d.select(zoneId);
  }

  function wireZoneButtons(container) {
    container.querySelectorAll(".mk-zone").forEach((btn) => {
      btn.addEventListener("click", () => selectZone(container, btn.dataset.zone));
    });
  }

  // Tries a few times in case the (deferred ES module) makhraj-3d.js hasn't finished
  // executing yet on a very first page load; falls back to the zone-list-only view
  // (still fully usable) if WebGL/Three.js never becomes available.
  function mount3d(container, attempt) {
    const mountEl = container.querySelector("#mk-3d-mount");
    if (!mountEl) return;
    if (!window.Makhraj3D) {
      // The Three.js CDN fetch can take a few seconds on a cold cache the very first time;
      // give it generous room before giving up and falling back to the zone list alone.
      if ((attempt || 0) < 60) { setTimeout(() => mount3d(container, (attempt || 0) + 1), 150); return; }
      mountEl.outerHTML = `<p class="makhraj-note">(تعذّر تحميل المجسّم ثلاثي الأبعاد؛ استخدم القائمة أدناه.)</p>`;
      return;
    }
    const zones = visibleZones();
    const defaultZone = mountEl.dataset.defaultZone || (zones[0] && zones[0].id) || null;
    instance3d = window.Makhraj3D.mount(mountEl, {
      zoneIds: zones.map((z) => z.id),
      colors: colorMapFor(zones),
      onSelect: (zoneId) => selectZone(container, zoneId, false),
    });
    if (instance3d && defaultZone) instance3d.select(defaultZone);
  }

  function wire(container) {
    wireZoneButtons(container);
    mount3d(container);
    const toggle = container.querySelector("[data-mk-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        detailed = !detailed;
        const zones = visibleZones();
        const row = container.querySelector("#mk-zone-row");
        let defaultZone = zones[0].id;
        row.innerHTML = zones.map((z) => zoneBlob(z, false)).join("");
        wireZoneButtons(container);
        selectZone(container, defaultZone, false);
        toggle.textContent = detailed ? "👶 عرض مبسّط (5 مناطق)" : "🔬 عرض علمي تفصيلي (أقصى/وسط/أدنى الحلق)";
        if (instance3d) {
          instance3d.setZones(zones.map((z) => z.id), colorMapFor(zones));
          instance3d.select(defaultZone);
        }
      });
    }
  }

  return { render, wire, renderInline, dataRegionsToUiZones };
})();
