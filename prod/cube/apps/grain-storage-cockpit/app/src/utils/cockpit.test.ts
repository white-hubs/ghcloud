import { describe, expect, test } from "bun:test";

import { filterConcernBatches, filterRiskEvents, resolvePalletCardUrl } from "./cockpit";
import { buildHunanMapOption, CHANGSHA_REGION_NAME } from "./hunan-map-option";
import { CONCERN_BATCHES, DEPOTS, RISK_EVENTS } from "@/mocks/cockpit-data";

describe("cockpit filters", () => {
  test("filters risk events by grain and level", () => {
    const result = filterRiskEvents(RISK_EVENTS, { depot: "全部", grain: "小麦", level: "红" });
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("粮温异常升高");
  });

  test("returns no batches when filters do not match", () => {
    const result = filterConcernBatches(CONCERN_BATCHES, { depot: "霞凝直属库", grain: "成品粮", level: "全部" });
    expect(result).toEqual([]);
  });
});

describe("navigation target", () => {
  test("uses wid=95 for both runtime modes", () => {
    expect(resolvePalletCardUrl(true)).toBe("/portal/granary-location-card/pallet-position-card?wid=95");
    expect(resolvePalletCardUrl(false)).toBe("/apps/granary/pallet-position-card?wid=95");
  });
});

describe("Hunan map option", () => {
  test("highlights Changsha and renders the depot point", () => {
    const option = buildHunanMapOption(DEPOTS[0]) as Record<string, any>;
    expect(option.geo.regions[0].name).toBe(CHANGSHA_REGION_NAME);
    expect(option.geo.regions[0].itemStyle.borderColor).toBe("#5cdbd3");
    expect(option.series[0].data[0].name).toBe("霞凝直属库");
  });
});
