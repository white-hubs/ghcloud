import { describe, expect, test } from "bun:test";

import { resolveCardLayoutProfile } from "./card-layout-profile";

describe("card layout profiles", () => {
  test("unknown cards default to chart class", () => {
    expect(resolveCardLayoutProfile("unknown-card")).toMatchObject({
      contentClass: "chart",
      weight: 1.15,
      slotMax: 400,
      fillMode: "stretch",
    });
  });

  test("kpi cards stay lighter and shorter than composite cards", () => {
    const kpi = resolveCardLayoutProfile("people-flow-today-statistics");
    const composite = resolveCardLayoutProfile("security-analysis");
    expect(kpi.contentClass).toBe("kpi");
    expect(composite.contentClass).toBe("composite");
    expect(composite.slotMax).toBeGreaterThan(kpi.slotMax);
    expect(composite.weight).toBeGreaterThan(kpi.weight);
    expect(resolveCardLayoutProfile("ups-work-situation").slotMax).toBe(340);
  });

  test("table cards keep rows fill mode", () => {
    expect(resolveCardLayoutProfile("security-alarm-record").contentClass).toBe("table");
    expect(resolveCardLayoutProfile("security-alarm-record").fillMode).toBe("rows");
    expect(resolveCardLayoutProfile("fire-equipment-statistics").fillMode).toBe("rows");
    expect(resolveCardLayoutProfile("command-dispatch-alarm-area-top5").fillMode).toBe("rows");
    expect(resolveCardLayoutProfile("alarm-status-and-list").fillMode).toBe("rows");
  });

  test("sparse KPI cards stay centered instead of stretching empty chrome", () => {
    expect(resolveCardLayoutProfile("ups-work-situation").fillMode).toBe("center");
    expect(resolveCardLayoutProfile("people-flow-today-statistics").fillMode).toBe("center");
  });

  test("overview chart cards get more height than risk-source", () => {
    expect(resolveCardLayoutProfile("security-analysis").weight).toBeGreaterThan(resolveCardLayoutProfile("security-risk-source").weight);
    expect(resolveCardLayoutProfile("security-analysis").weight).toBeGreaterThanOrEqual(1.4);
    expect(resolveCardLayoutProfile("security-analysis").slotMin).toBe(260);
    expect(resolveCardLayoutProfile("security-analysis").slotMax).toBe(460);
  });

  test("ring and dual-block cards stay stretch or inner-scroll", () => {
    expect(resolveCardLayoutProfile("alarm-level").fillMode).toBe("stretch");
    expect(resolveCardLayoutProfile("security-manage-trend").fillMode).toBe("stretch");
    expect(resolveCardLayoutProfile("security-alarm-event-ratio").fillMode).toBe("scroll");
  });

  test("alarm trend cards are composite so stats plus chart can grow", () => {
    expect(resolveCardLayoutProfile("alarm-status-and-trend").contentClass).toBe("composite");
    expect(resolveCardLayoutProfile("alarm-status-and-trend").slotMin).toBe(260);
    expect(resolveCardLayoutProfile("alarm-status-and-trend").slotMax).toBe(460);
  });

  test("market overview is a media card with a tall slot floor", () => {
    expect(resolveCardLayoutProfile("security-market-overview")).toMatchObject({
      contentClass: "media",
      slotMin: 720,
      slotMax: 900,
      weight: 1.8,
    });
  });

  test("unknown cards default slotMin to 260", () => {
    expect(resolveCardLayoutProfile("unknown-card").slotMin).toBe(260);
  });
});
