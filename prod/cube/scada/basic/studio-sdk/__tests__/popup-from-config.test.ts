import type { ElementInstance } from "@cube-scada/core";
import { describe, expect, it } from "vitest";

import { enrichScadaPopupWithSource, scadaPopupFromActionConfig } from "../src/popup-from-config";

function createSource(): ElementInstance {
  return {
    id: "pump-1",
    type: "basic.rect",
    label: "主泵",
    deviceBinding: "required",
    x: 0,
    y: 0,
    width: 100,
    height: 60,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {},
    bindings: [],
    eventHandlers: [],
    propertyBindings: [
      { propCode: "speed", propName: "转速", unitName: "rpm" },
      { propCode: "running", propName: "运行状态" },
    ],
  };
}

describe("popup config normalization", () => {
  it("keeps legacy popup actions compatible with default styles", () => {
    const event = scadaPopupFromActionConfig({ title: "详情", contentId: "demo-device", content: "说明" });

    expect(event).toMatchObject({
      title: "详情",
      contentId: "demo-device",
      content: "说明",
      style: {
        content: { textAlign: "left", fontSize: 14, color: "#262626", fontWeight: 400, lineHeight: 1.6 },
        device: {
          layout: "rows",
          textAlign: "left",
          labelFontSize: 13,
          labelColor: "#8c8c8c",
          labelFontWeight: 400,
          valueFontSize: 14,
          valueColor: "#262626",
          valueFontWeight: 500,
          rowGap: 10,
          columnGap: 16,
        },
      },
    });
  });

  it("normalizes configured content and device styles", () => {
    const event = scadaPopupFromActionConfig({
      contentStyle: { textAlign: "center", fontSize: 20, color: "#ff0000", fontWeight: 700, lineHeight: 2 },
      deviceStyle: {
        layout: "columns",
        textAlign: "right",
        labelFontSize: 12,
        labelColor: "#111111",
        labelFontWeight: 700,
        valueFontSize: 18,
        valueColor: "#00aa00",
        valueFontWeight: 700,
        rowGap: 8,
        columnGap: 24,
      },
    });

    expect(event.style.content).toEqual({
      textAlign: "center",
      fontSize: 20,
      color: "#ff0000",
      fontWeight: 700,
      lineHeight: 2,
    });
    expect(event.style.device).toMatchObject({ layout: "columns", textAlign: "right", valueFontSize: 18, columnGap: 24 });
  });

  it("enriches the same popup with fixed label/value device rows", () => {
    const base = scadaPopupFromActionConfig({ contentId: "demo-device", content: "自定义说明" });
    const values: Record<string, string | number | boolean> = { speed: 1450, running: true };
    const event = enrichScadaPopupWithSource(base, createSource(), (propCode) => values[propCode]);

    expect(event.contentId).toBe("demo-device");
    expect(event.content).toBe("自定义说明");
    expect(event.deviceData).toEqual([
      { label: "转速", value: "1450 rpm", propCode: "speed" },
      { label: "运行状态", value: "true", propCode: "running" },
    ]);
  });
});
