import type { CSSProperties, KeyboardEvent } from "react";
import makhrajDiagramSrc from "../../../assets/makhraj/makhraj-diagram.webp";
import type { MakhrajZone } from "../../../types/makhraj";

export interface MakhrajDiagramProps {
  zones: readonly MakhrajZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

type Point = readonly [number, number];

/** A real illustrated sagittal (side-view) cross-section, generated once as a static
 *  image (not traced from any copyrighted reference) and shipped as an asset — the
 *  colored anatomy itself lives in the picture; this component only adds clickable,
 *  highlightable hit-areas and labels on top of it, positioned to match. */
const IMAGE_WIDTH = 2000;
const IMAGE_HEIGHT = 1091;

const REGION_SHAPES: Record<string, readonly Point[]> = {
  // Nasal cavity, behind the nose bridge.
  khayshum: [
    [1045, 520],
    [1060, 420],
    [1100, 380],
    [1160, 365],
    [1220, 370],
    [1270, 390],
    [1310, 430],
    [1330, 470],
    [1320, 510],
    [1290, 540],
    [1250, 555],
    [1180, 560],
    [1110, 555],
    [1060, 540],
  ],
  // Oral cavity: the thin open strip above the tongue, below the nasal cavity.
  jawf: [
    [1000, 520],
    [1330, 510],
    [1335, 545],
    [1310, 565],
    [1250, 575],
    [1150, 578],
    [1050, 572],
    [1005, 555],
  ],
  // Lips, right at the mouth opening.
  shafatan: [
    [1235, 565],
    [1340, 565],
    [1340, 710],
    [1235, 710],
  ],
  // The tongue: the dominant shape filling most of the mouth.
  lisan: [
    [1000, 580],
    [1060, 565],
    [1150, 562],
    [1230, 570],
    [1270, 590],
    [1290, 620],
    [1295, 660],
    [1280, 700],
    [1250, 730],
    [1200, 745],
    [1140, 748],
    [1070, 742],
    [1015, 720],
    [990, 690],
    [985, 650],
    [990, 615],
  ],
};

/** The throat tube's four variants (combined, and the three أقصى/وسط/أدنى sub-regions)
 *  as quads following its curve down the neck. */
const TUBE_SHAPES: Record<string, readonly Point[]> = {
  halq: [
    [905, 390],
    [1010, 385],
    [1015, 440],
    [1000, 600],
    [985, 800],
    [945, 1005],
    [910, 1005],
    [880, 900],
    [885, 800],
    [895, 600],
    [900, 440],
  ],
  "adna-halq": [
    [900, 385],
    [1010, 385],
    [1000, 592],
    [895, 592],
  ],
  "wasat-halq": [
    [895, 592],
    [1000, 592],
    [980, 799],
    [885, 799],
  ],
  "aqsa-halq": [
    [885, 799],
    [980, 799],
    [945, 1005],
    [880, 1005],
  ],
};

/** Where each region's callout label sits in the right-hand margin, and the point on
 *  the shape its leader line is drawn from. */
const LABEL_ANCHORS: Record<string, { centroid: Point; labelY: number }> = {
  khayshum: { centroid: [1190, 460], labelY: 120 },
  jawf: { centroid: [1170, 545], labelY: 262 },
  shafatan: { centroid: [1290, 635], labelY: 403 },
  lisan: { centroid: [1140, 655], labelY: 545 },
  halq: { centroid: [945, 700], labelY: 828 },
  "adna-halq": { centroid: [950, 490], labelY: 687 },
  "wasat-halq": { centroid: [945, 700], labelY: 828 },
  "aqsa-halq": { centroid: [940, 900], labelY: 970 },
};

// The foreignObject labels live in the same 2000x1091 coordinate space as the image
// and region paths, so their CSS sizing (in makhraj.css) is scaled up to match —
// see the comment there.
const LABEL_X = 1500;
const LABEL_WIDTH = 450;
const LABEL_HEIGHT = 113;

/** Traces a smooth closed curve through every point (quadratic Béziers via each edge's
 *  midpoint) instead of straight segments, for a soft-edged highlight outline. */
function smoothClosedPath(points: readonly Point[]): string {
  const n = points.length;
  const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(points[n - 1], points[0]);
  let d = `M${start[0]},${start[1]} `;
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const next = points[(i + 1) % n];
    const m = mid(curr, next);
    d += `Q${curr[0]},${curr[1]} ${m[0]},${m[1]} `;
  }
  return d + "Z";
}

export function MakhrajDiagram({ zones, selectedZoneId, onSelectZone }: MakhrajDiagramProps) {
  function activate(event: KeyboardEvent, zoneId: string): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectZone(zoneId);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}
      className="mk-diagram"
      role="img"
      aria-label="رسم مقطعي جانبي للرأس والرقبة يوضح مناطق مخارج الحروف"
    >
      <image href={makhrajDiagramSrc} x={0} y={0} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />

      {zones.map((zone) => {
        const points = REGION_SHAPES[zone.id] ?? TUBE_SHAPES[zone.id];
        const anchor = LABEL_ANCHORS[zone.id];
        if (!points || !anchor) return null;
        const isSelected = zone.id === selectedZoneId;
        const style = { "--zone-color": zone.color } as CSSProperties;
        return (
          <g key={zone.id} style={style}>
            <line
              x1={anchor.centroid[0]}
              y1={anchor.centroid[1]}
              x2={LABEL_X}
              y2={anchor.labelY}
              className="mk-leader"
            />
            <path
              d={smoothClosedPath(points)}
              className={`mk-region${isSelected ? " selected" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={zone.label}
              aria-pressed={isSelected}
              onClick={() => onSelectZone(zone.id)}
              onKeyDown={(event) => activate(event, zone.id)}
            >
              <title>{zone.label}</title>
            </path>
            <foreignObject x={LABEL_X} y={anchor.labelY - LABEL_HEIGHT / 2} width={LABEL_WIDTH} height={LABEL_HEIGHT}>
              <button
                type="button"
                className={`mk-diagram-label-btn${isSelected ? " selected" : ""}`}
                onClick={() => onSelectZone(zone.id)}
                aria-pressed={isSelected}
              >
                <span className="mk-diagram-label-icon">{zone.icon}</span>
                <span className="mk-diagram-label-text">{zone.label}</span>
              </button>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
