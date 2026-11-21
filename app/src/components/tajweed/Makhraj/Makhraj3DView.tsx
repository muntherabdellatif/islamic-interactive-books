import { useEffect, useRef, useState } from "react";
import { mountMakhraj3D, type Makhraj3DInstance } from "../../../utils/makhraj3d";
import { colorMapFor } from "../../../utils/makhrajZoneHelpers";
import type { MakhrajZone } from "../../../types/makhraj";

export interface Makhraj3DViewProps {
  zones: readonly MakhrajZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export function Makhraj3DView({ zones, selectedZoneId, onSelectZone }: Makhraj3DViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Makhraj3DInstance | null>(null);
  const onSelectZoneRef = useRef(onSelectZone);
  onSelectZoneRef.current = onSelectZone;
  const [unavailable, setUnavailable] = useState(false);

  const zoneIds = zones.map((zone) => zone.id);
  const zoneIdsKey = zoneIds.join(",");

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const instance = mountMakhraj3D(el, {
      zoneIds,
      colors: colorMapFor(zones),
      onSelect: (zoneId) => onSelectZoneRef.current(zoneId),
    });
    instanceRef.current = instance;
    setUnavailable(instance === null);
    return () => {
      instance?.destroy();
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIdsKey]);

  useEffect(() => {
    instanceRef.current?.select(selectedZoneId);
  }, [selectedZoneId]);

  if (unavailable) {
    return <p className="makhraj-note">(تعذّر تحميل المجسّم ثلاثي الأبعاد؛ استخدم القائمة أدناه.)</p>;
  }
  return <div ref={mountRef} className="mk-3d-mount" />;
}
