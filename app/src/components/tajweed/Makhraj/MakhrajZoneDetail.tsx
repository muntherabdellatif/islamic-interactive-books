import type { CSSProperties } from "react";
import type { TajweedDataset } from "../../../services/tajweedDataService";
import { findZone, lettersForUiZone } from "../../../utils/makhrajZoneHelpers";
import { HALQ_SUBS } from "../../../constants/makhrajZones";
import { lettersForRegion } from "../../../services/tajweedSelectors";

export interface MakhrajZoneDetailProps {
  dataset: TajweedDataset;
  zoneId: string;
}

export function MakhrajZoneDetail({ dataset, zoneId }: MakhrajZoneDetailProps) {
  const zone = findZone(zoneId);
  if (!zone) return null;

  const letters = HALQ_SUBS.includes(zoneId) ? lettersForRegion(dataset, zoneId) : lettersForUiZone(dataset, zoneId);
  const label = zone.sub || zone.label;

  return (
    <div className="mk-detail-card" style={{ "--zone-color": zone.color } as CSSProperties}>
      <div className="mk-detail-title">
        {zone.icon} {label}
      </div>
      <div className="letter-set">
        {letters.map((letter) => (
          <span key={letter} className="letter-chip" style={{ borderColor: zone.color }}>
            {letter}
          </span>
        ))}
      </div>
      <p className="makhraj-note">{zone.tipAr}</p>
    </div>
  );
}
