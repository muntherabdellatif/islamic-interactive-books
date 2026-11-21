import type { CSSProperties } from "react";
import type { TajweedDataset } from "../../../services/tajweedDataService";
import { UI_ZONES } from "../../../constants/makhrajZones";
import { dataRegionsToUiZones, lettersForUiZone } from "../../../utils/makhrajZoneHelpers";

export interface MakhrajInlineProps {
  dataset: TajweedDataset;
  regionIds: readonly string[];
}

/** Compact, always-visible zone summary embedded directly inside a rule tab. */
export function MakhrajInline({ dataset, regionIds }: MakhrajInlineProps) {
  const uiZoneIds = dataRegionsToUiZones(regionIds);
  if (!uiZoneIds.length) return null;

  return (
    <div className="mk-inline-group">
      {uiZoneIds.map((zoneId) => {
        const zone = UI_ZONES.find((z) => z.id === zoneId);
        if (!zone) return null;
        const letters = lettersForUiZone(dataset, zoneId);
        return (
          <div key={zoneId} className="mk-inline" style={{ "--zone-color": zone.color } as CSSProperties}>
            <span className="mk-inline-icon">{zone.icon}</span>
            <div className="mk-inline-body">
              <strong>{zone.sub}</strong>
              <div className="letter-set">
                {letters.map((letter) => (
                  <span key={letter} className="letter-chip" style={{ borderColor: zone.color }}>
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
