export type CardFillMode = "center" | "stretch" | "rows" | "scroll";
export type CardContentClass = "kpi" | "chart" | "composite" | "table" | "media";

export interface CardLayoutProfile {
  contentClass: CardContentClass;
  weight: number;
  slotMin: number;
  slotMax: number;
  fillMode: CardFillMode;
}

export interface PanelLayoutPolicy {
  maxVisibleCount?: number;
  fillAvailableHeight?: boolean;
  bottomInset?: number;
  equalVisibleRows?: boolean;
}

const CLASS_DEFAULTS: Record<CardContentClass, Omit<CardLayoutProfile, "contentClass">> = {
  kpi: { weight: 0.9, slotMin: 260, slotMax: 340, fillMode: "center" },
  chart: { weight: 1.15, slotMin: 260, slotMax: 400, fillMode: "stretch" },
  composite: { weight: 1.35, slotMin: 260, slotMax: 460, fillMode: "stretch" },
  table: { weight: 1.2, slotMin: 260, slotMax: 420, fillMode: "rows" },
  media: { weight: 1.8, slotMin: 720, slotMax: 900, fillMode: "stretch" },
};

const profile = (contentClass: CardContentClass, overrides: Partial<Omit<CardLayoutProfile, "contentClass">> = {}): CardLayoutProfile => ({
  contentClass,
  ...CLASS_DEFAULTS[contentClass],
  ...overrides,
});

const DEFAULT_PROFILE = profile("chart");
const CARD_LAYOUT_PROFILES: Record<string, CardLayoutProfile> = {
  "security-alarm-record": profile("table"),
  "alarm-status-and-list": profile("table"),
  "command-dispatch-alarm-area-top5": profile("table"),
  "fire-equipment-statistics": profile("table"),
  "ups-work-situation": profile("kpi"),
  "people-flow-today-statistics": profile("kpi"),
  "security-analysis": profile("composite", { weight: 1.45 }),
  "security-risk-source": profile("composite"),
  "security-market-overview": profile("media"),
  "security-device-count": profile("composite"),
  "security-monitor-device-count": profile("composite"),
  "electrical-device": profile("composite"),
  "environmental-device": profile("composite"),
  "alarm-level": profile("composite"),
  "fire-device-distribution": profile("composite"),
  "security-alarm-count": profile("composite"),
  "fire-pipe-network": profile("composite"),
  "security-alarm-event-ratio": profile("composite", { fillMode: "scroll" }),
  "alarm-status-and-trend": profile("composite"),
  "security-manage-trend": profile("chart"),
  "security-monitor": profile("chart"),
  "security-alarm-trend": profile("chart"),
  "security-alarm-event-count": profile("chart"),
};

export const resolveCardLayoutProfile = (code: string): CardLayoutProfile => CARD_LAYOUT_PROFILES[code] ?? DEFAULT_PROFILE;

/** All split-card sidebars share the same first-screen geometry. Media cards occupy their own first screen. */
export const resolvePanelLayoutPolicy = (firstCardCode?: string): PanelLayoutPolicy => ({
  maxVisibleCount: resolveCardLayoutProfile(firstCardCode ?? "").contentClass === "media" ? 1 : 3,
  fillAvailableHeight: true,
  bottomInset: 10,
  equalVisibleRows: true,
});
