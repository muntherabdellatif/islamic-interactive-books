import { useEffect, useState } from "react";
import type { TajweedDataset } from "../../../services/tajweedDataService";
import { HALQ_DETAIL_ZONES, HALQ_SUBS } from "../../../constants/makhrajZones";
import { dataRegionsToUiZones, visibleZones } from "../../../utils/makhrajZoneHelpers";
import { Makhraj3DView } from "./Makhraj3DView";
import { MakhrajZoneRow } from "./MakhrajZoneRow";
import { MakhrajZoneDetail } from "./MakhrajZoneDetail";

export interface MakhrajPanelProps {
  dataset: TajweedDataset;
  focusRegions: readonly string[] | null;
}

function computeDefaultZone(focusRegions: readonly string[] | null, detailed: boolean): string | null {
  const focusZones = dataRegionsToUiZones(focusRegions);
  const defaultZone = focusZones[0] ?? null;
  if (detailed && defaultZone === "halq") {
    return (focusRegions ?? []).find((region) => HALQ_SUBS.includes(region)) ?? HALQ_DETAIL_ZONES[0]?.id ?? null;
  }
  return defaultZone;
}

export function MakhrajPanel({ dataset, focusRegions }: MakhrajPanelProps) {
  const [detailed, setDetailed] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(() => computeDefaultZone(focusRegions, false));

  useEffect(() => {
    setSelectedZoneId(computeDefaultZone(focusRegions, detailed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRegions]);

  function handleToggleDetailed(): void {
    const next = !detailed;
    setDetailed(next);
    setSelectedZoneId(visibleZones(next)[0]?.id ?? null);
  }

  const zones = visibleZones(detailed);

  return (
    <div className="panel-section">
      <div className="panel-section-title">🗺️ خريطة مخارج الحروف</div>
      <p className="mk-hint">
        دوِّر المجسّم بإصبعك أو بالماوس لترى الرأس والرقبة من كل جانب، أو اضغط على منطقة (في المجسّم أو في القائمة)
        لترى حروفها.
      </p>
      <Makhraj3DView zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
      <button type="button" className="mk-detail-toggle" onClick={handleToggleDetailed}>
        {detailed ? "👶 عرض مبسّط (5 مناطق)" : "🔬 عرض علمي تفصيلي (أقصى/وسط/أدنى الحلق)"}
      </button>
      <MakhrajZoneRow zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
      {selectedZoneId ? <MakhrajZoneDetail dataset={dataset} zoneId={selectedZoneId} /> : null}
    </div>
  );
}
