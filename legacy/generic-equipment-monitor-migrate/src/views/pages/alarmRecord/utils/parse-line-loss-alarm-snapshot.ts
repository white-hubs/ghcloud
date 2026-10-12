import { replaceData, type ElectricalData } from "@ghcloud/cube-graph-editor-electrical";

export function parseLineLossTopologyFromAlarmSnapshot(raw: string | undefined | null): ElectricalData | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  const str = String(raw).trim();
  if (str === "") {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(str);
  } catch {
    return null;
  }

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const normalized = replaceData(parsed as { nodeList?: unknown[]; connectionList?: unknown[] });
  return normalized.electricalData;
}
