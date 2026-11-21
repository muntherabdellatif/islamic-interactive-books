import type { TajweedDataset } from "../services/tajweedDataService";
import { khayshumLetters, lettersForRegion } from "../services/tajweedSelectors";
import { HALQ_DETAIL_ZONES, HALQ_SUBS, UI_ZONES } from "../constants/makhrajZones";
import type { MakhrajZone } from "../types/makhraj";

export function uiZoneForDataRegion(regionId: string): string {
  return HALQ_SUBS.includes(regionId) ? "halq" : regionId;
}

export function dataRegionsToUiZones(regionIds: readonly string[] | null | undefined): string[] {
  return [...new Set((regionIds ?? []).map(uiZoneForDataRegion))];
}

/** الخيشوم isn't a primary place of articulation for any letter — ن/م are articulated
 * elsewhere and simply carry a nasal hum (غنة) through it. */
export function lettersForUiZone(dataset: TajweedDataset, zoneId: string): string[] {
  if (zoneId === "halq") {
    return [...new Set(HALQ_SUBS.flatMap((region) => lettersForRegion(dataset, region)))];
  }
  if (zoneId === "khayshum") return khayshumLetters(dataset);
  return lettersForRegion(dataset, zoneId);
}

export function visibleZones(detailed: boolean): readonly MakhrajZone[] {
  if (!detailed) return UI_ZONES;
  const halqIndex = UI_ZONES.findIndex((zone) => zone.id === "halq");
  return [...UI_ZONES.slice(0, halqIndex), ...HALQ_DETAIL_ZONES, ...UI_ZONES.slice(halqIndex + 1)];
}

export function findZone(zoneId: string): MakhrajZone | undefined {
  return UI_ZONES.find((zone) => zone.id === zoneId) ?? HALQ_DETAIL_ZONES.find((zone) => zone.id === zoneId);
}

function hexToNumber(color: string): number {
  return parseInt(color.replace("#", ""), 16);
}

export function colorMapFor(zones: readonly MakhrajZone[]): Record<string, number> {
  const map: Record<string, number> = {};
  zones.forEach((zone) => {
    map[zone.id] = hexToNumber(zone.color);
  });
  return map;
}
