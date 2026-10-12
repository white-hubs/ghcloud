export type ModelQualityOption = {
  value: string;
  label: string;
};

export const modelQualityList: ModelQualityOption[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const QUALITY_ALIASES: Record<string, string> = {
  high: "high",
  medium: "medium",
  low: "low",
  高: "high",
  中: "medium",
  低: "low",
  高清: "high",
  中等: "medium",
  低清: "low",
};

export function resolveModelQualityOption(raw: unknown): ModelQualityOption | undefined {
  if (raw == null) {
    return undefined;
  }
  if (typeof raw === "object" && raw !== null && "value" in raw) {
    const value = String((raw as { value?: unknown }).value ?? "").trim();
    const label = String((raw as { label?: unknown }).label ?? "").trim();
    const byValue = modelQualityList.find((e) => e.value === value || e.value === value.toLowerCase());
    if (byValue) {
      return byValue;
    }
    if (value && label) {
      return { value, label };
    }
  }

  const text = String(raw).trim();
  if (!text) {
    return undefined;
  }
  const byLabel = modelQualityList.find((e) => e.label === text);
  if (byLabel) {
    return byLabel;
  }
  const mapped = QUALITY_ALIASES[text] ?? QUALITY_ALIASES[text.toLowerCase()];
  if (mapped) {
    return modelQualityList.find((e) => e.value === mapped);
  }
  return modelQualityList.find((e) => e.value === text || e.value === text.toLowerCase());
}
