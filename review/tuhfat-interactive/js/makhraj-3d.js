/**
 * Stylized 3D head/neck sagittal diagram for the "مخارج الحروف" tab, replacing the flat
 * emoji-only cards as the primary visual. Not a scanned/medical model — a simple procedural
 * profile (consistent with interactive.json's own "تبسيط تعليمي لا رسم تشريحي دقيق" note) —
 * but a real rotatable/zoomable 3D object, so a child or parent can see the head and neck
 * from any angle, with each articulation zone glowing in its own colour and pulsing when
 * selected. Loaded as an ES module (deferred); exposes a single global, `window.Makhraj3D`,
 * for the classic (non-module) scripts in this app to call.
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const Makhraj3D = (() => {
  // Side-profile coordinate space: x = front(+)/back(-) of the head, y = up(+)/down(-),
  // z = the slab's thickness (what orbiting reveals). Coordinates are a friendly
  // approximation of a head+neck silhouette, not a traced medical scan.
  const HEAD_OUTLINE = [
    [-1.00, 1.10], [-0.20, 1.35], [0.55, 1.18], [0.82, 0.90], [0.95, 0.72],
    [1.25, 0.55], [1.05, 0.42], [1.17, 0.30], [1.03, 0.22], [1.17, 0.12],
    [1.00, -0.15], [0.72, -0.33], [0.58, -0.55], [0.55, -0.95], [0.55, -1.90],
    [-0.35, -1.90], [-0.35, -0.55], [-0.85, 0.20],
  ];

  const REGION_SHAPES = {
    khayshum: [[0.68, 0.82], [0.92, 0.84], [0.98, 0.68], [0.78, 0.62]],
    shafatan: [[1.20, 0.33], [1.22, 0.24], [1.22, 0.16], [1.20, 0.09], [1.06, 0.15], [1.02, 0.22], [1.06, 0.30]],
    lisan: [[0.50, 0.18], [0.95, 0.20], [1.00, 0.08], [0.85, -0.05], [0.55, -0.02]],
    jawf: [[0.55, 0.20], [0.98, 0.15], [0.65, -0.55], [0.48, -0.55], [0.40, -0.20]],
    halq: [[0.52, -0.55], [0.70, -0.55], [0.70, -1.55], [0.40, -1.55], [0.40, -0.55]],
    "adna-halq": [[0.52, -0.55], [0.70, -0.55], [0.70, -0.88], [0.40, -0.88], [0.40, -0.55]],
    "wasat-halq": [[0.40, -0.88], [0.70, -0.88], [0.70, -1.22], [0.40, -1.22]],
    "aqsa-halq": [[0.40, -1.22], [0.70, -1.22], [0.70, -1.55], [0.40, -1.55]],
  };

  function shapeFromPoints(points) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    shape.closePath();
    return shape;
  }

  function extrude(points, depth) {
    return new THREE.ExtrudeGeometry(shapeFromPoints(points), {
      depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2,
    });
  }

  let current = null;

  function mount(el, { zoneIds, colors, onSelect }) {
    if (current) current.destroy();

    const width = el.clientWidth || 300, height = el.clientHeight || 260;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const target = new THREE.Vector3(0, -0.27, 0);
    let radius = 4.6, theta = 0, phi = 1.3; // spherical orbit around `target`

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return null; // caller falls back to the 2D-only view
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(2, 3, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-3, 1, -2);
    scene.add(fill);

    const headMat = new THREE.MeshStandardMaterial({ color: 0xf0dcc3, roughness: 0.75 });
    const headMesh = new THREE.Mesh(extrude(HEAD_OUTLINE, 0.3), headMat);
    headMesh.position.z = -0.15;
    scene.add(headMesh);

    const regionMeshes = [];
    function buildRegions(ids, colorMap) {
      regionMeshes.forEach((m) => scene.remove(m));
      regionMeshes.length = 0;
      ids.forEach((id) => {
        const pts = REGION_SHAPES[id];
        if (!pts) return;
        const mat = new THREE.MeshStandardMaterial({
          color: colorMap[id] || 0x999999, roughness: 0.5, emissive: new THREE.Color(colorMap[id] || 0x999999), emissiveIntensity: 0,
        });
        const mesh = new THREE.Mesh(extrude(pts, 0.14), mat);
        mesh.position.z = 0.02;
        mesh.userData.zoneId = id;
        scene.add(mesh);
        regionMeshes.push(mesh);
      });
    }
    buildRegions(zoneIds, colors);

    let selectedId = null;
    let lastInteraction = 0;
    const clock = new THREE.Clock();
    let dragging = false, moved = false, lastX = 0, lastY = 0;

    function pointerPos(ev) {
      const rect = el.getBoundingClientRect();
      const p = ev.touches ? ev.touches[0] : ev;
      return { x: p.clientX - rect.left, y: p.clientY - rect.top };
    }
    function onDown(ev) {
      dragging = true; moved = false;
      const p = pointerPos(ev); lastX = p.x; lastY = p.y;
    }
    function onMove(ev) {
      if (!dragging) return;
      const p = pointerPos(ev);
      const dx = p.x - lastX, dy = p.y - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      theta -= dx * 0.01;
      phi = Math.min(2.4, Math.max(0.5, phi - dy * 0.01));
      lastX = p.x; lastY = p.y;
      lastInteraction = clock.getElapsedTime();
    }
    function onUp(ev) {
      if (dragging && !moved) {
        const p = pointerPos(ev);
        const ndc = new THREE.Vector2((p.x / width) * 2 - 1, -(p.y / height) * 2 + 1);
        const ray = new THREE.Raycaster();
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects(regionMeshes);
        if (hits.length && typeof onSelect === "function") onSelect(hits[0].object.userData.zoneId);
      }
      dragging = false;
    }
    function onWheel(ev) {
      ev.preventDefault();
      radius = Math.min(7, Math.max(2.8, radius + ev.deltaY * 0.0025));
    }
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    let ro;
    try {
      ro = new ResizeObserver(() => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(el);
    } catch (e) { /* ResizeObserver not critical */ }

    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!dragging && t - lastInteraction > 3) theta += 0.0025; // gentle idle auto-rotate
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
      regionMeshes.forEach((m) => {
        const isSel = m.userData.zoneId === selectedId;
        m.material.emissiveIntensity = isSel ? 0.35 + 0.25 * Math.sin(t * 4) : 0;
        const s = isSel ? 1 + 0.04 * Math.sin(t * 4) : 1;
        m.scale.setScalar(s);
      });
      renderer.render(scene, camera);
    }
    animate();

    const instance = {
      select(zoneId) { selectedId = zoneId; },
      setZones(ids, colorMap) { buildRegions(ids, colorMap); },
      destroy() {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        el.removeEventListener("wheel", onWheel);
        if (ro) ro.disconnect();
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        if (current === instance) current = null;
      },
    };
    current = instance;
    return instance;
  }

  return { mount };
})();

window.Makhraj3D = Makhraj3D;
