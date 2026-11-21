import * as THREE from "three";

/**
 * Stylized 3D head/neck sagittal diagram for the مخارج الحروف tab — a simple procedural
 * profile (not a traced medical scan), rotatable/zoomable, with each articulation zone
 * glowing in its own colour and pulsing when selected.
 */

type Point2D = [number, number];

const HEAD_OUTLINE: readonly Point2D[] = [
  [-1.0, 1.1], [-0.2, 1.35], [0.55, 1.18], [0.82, 0.9], [0.95, 0.72],
  [1.25, 0.55], [1.05, 0.42], [1.17, 0.3], [1.03, 0.22], [1.17, 0.12],
  [1.0, -0.15], [0.72, -0.33], [0.58, -0.55], [0.55, -0.95], [0.55, -1.9],
  [-0.35, -1.9], [-0.35, -0.55], [-0.85, 0.2],
];

const REGION_SHAPES: Record<string, readonly Point2D[]> = {
  khayshum: [[0.68, 0.82], [0.92, 0.84], [0.98, 0.68], [0.78, 0.62]],
  shafatan: [[1.2, 0.33], [1.22, 0.24], [1.22, 0.16], [1.2, 0.09], [1.06, 0.15], [1.02, 0.22], [1.06, 0.3]],
  lisan: [[0.5, 0.18], [0.95, 0.2], [1.0, 0.08], [0.85, -0.05], [0.55, -0.02]],
  jawf: [[0.55, 0.2], [0.98, 0.15], [0.65, -0.55], [0.48, -0.55], [0.4, -0.2]],
  halq: [[0.52, -0.55], [0.7, -0.55], [0.7, -1.55], [0.4, -1.55], [0.4, -0.55]],
  "adna-halq": [[0.52, -0.55], [0.7, -0.55], [0.7, -0.88], [0.4, -0.88], [0.4, -0.55]],
  "wasat-halq": [[0.4, -0.88], [0.7, -0.88], [0.7, -1.22], [0.4, -1.22]],
  "aqsa-halq": [[0.4, -1.22], [0.7, -1.22], [0.7, -1.55], [0.4, -1.55]],
};

const THETA_LIMIT_RADIANS = 1.05; // ~60deg either side of the default side view
const IDLE_ROTATE_SPEED = 0.0025;
const IDLE_DELAY_SECONDS = 3;
const MIN_RADIUS = 2.8;
const MAX_RADIUS = 7;
const DEFAULT_RADIUS = 4.6;

function shapeFromPoints(points: readonly Point2D[]): THREE.Shape {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  return shape;
}

function extrude(points: readonly Point2D[], depth: number): THREE.ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shapeFromPoints(points), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
}

export interface Makhraj3DMountOptions {
  zoneIds: readonly string[];
  colors: Record<string, number>;
  onSelect: (zoneId: string) => void;
}

export interface Makhraj3DInstance {
  select: (zoneId: string | null) => void;
  setZones: (zoneIds: readonly string[], colors: Record<string, number>) => void;
  destroy: () => void;
}

export function mountMakhraj3D(el: HTMLElement, options: Makhraj3DMountOptions): Makhraj3DInstance | null {
  const width = el.clientWidth || 300;
  const height = el.clientHeight || 260;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  const target = new THREE.Vector3(0, -0.27, 0);
  let radius = DEFAULT_RADIUS;
  let theta = 0;
  let phi = 1.3;
  let autoRotateDir = 1;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
  keyLight.position.set(2, 3, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-3, 1, -2);
  scene.add(fillLight);

  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf0dcc3, roughness: 0.75 });
  const headMesh = new THREE.Mesh(extrude(HEAD_OUTLINE, 0.3), headMaterial);
  headMesh.position.z = -0.15;
  scene.add(headMesh);

  const regionMeshes: THREE.Mesh[] = [];
  function buildRegions(ids: readonly string[], colorMap: Record<string, number>): void {
    regionMeshes.forEach((mesh) => scene.remove(mesh));
    regionMeshes.length = 0;
    ids.forEach((id) => {
      const points = REGION_SHAPES[id];
      if (!points) return;
      const color = colorMap[id] ?? 0x999999;
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.5,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(extrude(points, 0.14), material);
      mesh.position.z = 0.02;
      mesh.userData["zoneId"] = id;
      scene.add(mesh);
      regionMeshes.push(mesh);
    });
  }
  buildRegions(options.zoneIds, options.colors);

  let selectedId: string | null = null;
  let lastInteraction = 0;
  const clock = new THREE.Clock();
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let lastY = 0;

  function pointerPos(event: PointerEvent): { x: number; y: number } {
    const rect = el.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function onDown(event: PointerEvent): void {
    dragging = true;
    moved = false;
    const p = pointerPos(event);
    lastX = p.x;
    lastY = p.y;
  }
  function onMove(event: PointerEvent): void {
    if (!dragging) return;
    const p = pointerPos(event);
    const dx = p.x - lastX;
    const dy = p.y - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    theta = Math.min(THETA_LIMIT_RADIANS, Math.max(-THETA_LIMIT_RADIANS, theta - dx * 0.01));
    phi = Math.min(2.4, Math.max(0.5, phi - dy * 0.01));
    lastX = p.x;
    lastY = p.y;
    lastInteraction = clock.getElapsedTime();
  }
  function onUp(event: PointerEvent): void {
    if (dragging && !moved) {
      const p = pointerPos(event);
      const ndc = new THREE.Vector2((p.x / width) * 2 - 1, -(p.y / height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(regionMeshes);
      const zoneId = hits[0]?.object.userData["zoneId"] as string | undefined;
      if (zoneId) options.onSelect(zoneId);
    }
    dragging = false;
  }
  function onWheel(event: WheelEvent): void {
    event.preventDefault();
    radius = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, radius + event.deltaY * 0.0025));
  }
  el.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });

  let resizeObserver: ResizeObserver | undefined;
  try {
    resizeObserver = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(el);
  } catch {
    // ResizeObserver not critical
  }

  let animationFrame = 0;
  function animate(): void {
    animationFrame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (!dragging && t - lastInteraction > IDLE_DELAY_SECONDS) {
      theta += autoRotateDir * IDLE_ROTATE_SPEED;
      if (theta > THETA_LIMIT_RADIANS) {
        theta = THETA_LIMIT_RADIANS;
        autoRotateDir = -1;
      }
      if (theta < -THETA_LIMIT_RADIANS) {
        theta = -THETA_LIMIT_RADIANS;
        autoRotateDir = 1;
      }
    }
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    );
    camera.lookAt(target);
    regionMeshes.forEach((mesh) => {
      const isSelected = mesh.userData["zoneId"] === selectedId;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isSelected ? 0.35 + 0.25 * Math.sin(t * 4) : 0;
      mesh.scale.setScalar(isSelected ? 1 + 0.04 * Math.sin(t * 4) : 1);
    });
    renderer.render(scene, camera);
  }
  animate();

  const instance: Makhraj3DInstance = {
    select(zoneId) {
      selectedId = zoneId;
    },
    setZones(ids, colorMap) {
      buildRegions(ids, colorMap);
    },
    destroy() {
      cancelAnimationFrame(animationFrame);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
      resizeObserver?.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    },
  };
  return instance;
}
