import type { CSSProperties } from "react";
import type { MakhrajZone } from "../../../types/makhraj";

export interface MakhrajZoneRowProps {
  zones: readonly MakhrajZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export function MakhrajZoneRow({ zones, selectedZoneId, onSelectZone }: MakhrajZoneRowProps) {
  return (
    <div className="mk-zones">
      {zones.map((zone) => (
        <button
          key={zone.id}
          type="button"
          className={`mk-zone ${zone.id === selectedZoneId ? "active" : ""}`}
          style={{ "--zone-color": zone.color } as CSSProperties}
          onClick={() => onSelectZone(zone.id)}
        >
          <span className="mk-zone-icon">{zone.icon}</span>
          <span className="mk-zone-label">{zone.label}</span>
        </button>
      ))}
    </div>
  );
}
