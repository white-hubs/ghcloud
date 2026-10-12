import { describe, expect, test } from "bun:test";

import { resolveCardLayoutProfile, resolvePanelLayoutPolicy } from "./card-layout-profile";
import { resolvePanelSlotPacking, SLOT_GAP, SLOT_MIN } from "./panel-slot-packing";

const chart = { weight: 1.15, slotMin: 280, slotMax: 400 };
const composite = { weight: 1.35, slotMin: 280, slotMax: 460 };
const kpi = { weight: 0.9, slotMin: 280, slotMax: 340 };
const media = { weight: 1.8, slotMin: 720, slotMax: 900 };

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

describe("resolvePanelSlotPacking", () => {
  test("card gap is 12px", () => {
    expect(SLOT_GAP).toBe(12);
  });
  test("1080p three regular cards stay visible and grow toward design height", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 3,
      availableHeight: 940,
      uiScale: 1,
      profiles: [composite, chart, chart],
    });
    expect(packing.visibleCount).toBe(3);
    expect(packing.mode).toBe("pack");
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.paddingTop).toBe(0);
    expect(packing.paddingBottom).toBe(0);
    expect(packing.slotHeights).toHaveLength(3);
    expect(Math.min(...packing.slotHeights)).toBeGreaterThanOrEqual(280);
    expect(sum(packing.slotHeights) + packing.gap * 2).toBeCloseTo(940, 0);
    expect(packing.slotHeights[0]).toBeGreaterThan(packing.slotHeights[1]);
  });

  test("both access control panels show three complete cards at a 900px window height", () => {
    const sides = [
      ["device-realtime-status", "abnormal-event-top5", "abnormal-traffic-trend-new", "safe-operation-days"],
      ["personnel-traffic-trend", "passage-analysis", "real-time-passage-data"],
    ];
    for (const codes of sides) {
      const profiles = codes.map(resolveCardLayoutProfile);
      const policy = resolvePanelLayoutPolicy(codes[0]);
      const availableHeight = 900 - 64 - (policy.bottomInset ?? 76);
      const packing = resolvePanelSlotPacking({
        cardCount: profiles.length,
        availableHeight,
        uiScale: 1,
        profiles,
        ...policy,
      });
      expect(packing.visibleCount).toBe(3);
      expect(packing.mode).toBe(codes.length > 3 ? "scroll" : "pack");
      expect(Math.min(...packing.slotHeights)).toBeGreaterThanOrEqual(SLOT_MIN);
      expect(sum(packing.slotHeights.slice(0, 3)) + packing.gap * 2).toBe(availableHeight);
    }
  });

  test("access and people-flow menus share three aligned rows and a 10px bottom inset", () => {
    const menuSides = [
      [
        ["device-realtime-status", "abnormal-event-top5", "abnormal-traffic-trend-new", "safe-operation-days"],
        ["personnel-traffic-trend", "passage-analysis", "real-time-passage-data"],
      ],
      [
        ["people-flow-today-statistics", "people-flow-statistics", "people-flow-distribution"],
        ["people-flow-monitor", "people-flow-point", "people-flow-alarm", "people-flow-alarm-record"],
      ],
    ];
    for (const windowHeight of [900, 950, 1440]) {
      for (const [leftCodes, rightCodes] of menuSides) {
        const pack = (codes: string[]) => {
          const policy = resolvePanelLayoutPolicy(codes[0]);
          const availableHeight = windowHeight - 64 - (policy.bottomInset ?? 76);
          return resolvePanelSlotPacking({
            cardCount: codes.length,
            availableHeight,
            uiScale: 1,
            profiles: codes.map(resolveCardLayoutProfile),
            ...policy,
          });
        };
        const leftPacking = pack(leftCodes);
        const rightPacking = pack(rightCodes);
        const availableHeight = windowHeight - 64 - 10;
        expect(leftPacking.visibleCount).toBe(3);
        expect(rightPacking.visibleCount).toBe(3);
        expect(leftPacking.slotHeights.slice(0, 3)).toEqual(rightPacking.slotHeights.slice(0, 3));
        expect(sum(leftPacking.slotHeights.slice(0, 3)) + leftPacking.gap * 2).toBe(availableHeight);
        expect(sum(rightPacking.slotHeights.slice(0, 3)) + rightPacking.gap * 2).toBe(availableHeight);
      }
    }
  });

  test("media overview keeps the next card below the first screen", () => {
    const policy = resolvePanelLayoutPolicy("security-market-overview");
    const availableHeight = 1080 - 64 - (policy.bottomInset ?? 76);
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight,
      uiScale: 1,
      profiles: ["security-market-overview", "security-device-count"].map(resolveCardLayoutProfile),
      ...policy,
    });
    expect(packing.visibleCount).toBe(1);
    expect(packing.slotHeights[0]).toBe(availableHeight);
    expect(packing.mode).toBe("scroll");
  });

  test("768p drops to two visible cards and scrolls the third at a complete height", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 3,
      availableHeight: 628,
      uiScale: 1,
      profiles: [composite, chart, chart],
    });
    expect(packing.visibleCount).toBe(2);
    expect(packing.mode).toBe("scroll");
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(packing.slotHeights[2]).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(packing.paddingBottom).toBe(628 - packing.slotHeights[0] - packing.slotHeights[1] - packing.gap);
    expect(packing.paddingBottom).toBeGreaterThanOrEqual(0);
  });

  test("two-card leftover grows cards to slotMax then leaves the rest unused", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 940,
      uiScale: 1,
      profiles: [composite, kpi],
    });
    expect(packing.mode).toBe("pack");
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.slotHeights[0]).toBe(460);
    expect(packing.slotHeights[1]).toBe(340);
    expect(sum(packing.slotHeights) + packing.gap).toBeLessThan(940);
  });

  test("single card stops at slotMax instead of eating the sidebar", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 1,
      availableHeight: 940,
      uiScale: 1,
      profiles: [{ weight: 1.45, slotMin: 280, slotMax: 460 }],
    });
    expect(packing.slotHeights[0]).toBe(460);
    expect(packing.paddingTop).toBe(0);
    expect(packing.gap).toBe(SLOT_GAP);
  });

  test("1080p market overview takes the first screen and scrolls the device card", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 940,
      uiScale: 1,
      profiles: [media, composite],
    });
    expect(packing.visibleCount).toBe(1);
    expect(packing.mode).toBe("scroll");
    expect(packing.slotHeights[0]).toBe(900);
    expect(packing.slotHeights[1]).toBeGreaterThanOrEqual(SLOT_MIN);
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.paddingBottom).toBe(40);
  });

  test("tall window can show market overview and device stats together", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 2,
      availableHeight: 1100,
      uiScale: 1,
      profiles: [media, composite],
    });
    expect(packing.visibleCount).toBe(2);
    expect(packing.mode).toBe("pack");
    expect(packing.slotHeights[0]).toBeGreaterThanOrEqual(720);
    expect(packing.slotHeights[0]).toBeLessThanOrEqual(900);
    expect(packing.gap).toBe(SLOT_GAP);
    expect(packing.paddingBottom).toBe(0);
  });

  test("empty packing keeps paddingBottom at 0", () => {
    const packing = resolvePanelSlotPacking({
      cardCount: 0,
      availableHeight: 940,
      uiScale: 1,
      profiles: [],
    });
    expect(packing.mode).toBe("empty");
    expect(packing.paddingBottom).toBe(0);
    expect(packing.paddingTop).toBe(0);
  });
});
