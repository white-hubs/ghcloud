import { describe, expect, it } from "bun:test";

import { buildInlinePropertyPanelModel } from "../src/inline-property-panel";

describe("inline property panel", () => {
  it("splits label and value while keeping their typography independent", () => {
    expect(
      buildInlinePropertyPanelModel({
        displayBody: "温度: 26 ℃\n运行状态: 正常",
        fontSize: 13,
        fill: "#667085",
        valueFontSize: 16,
        valueFill: "#1677ff",
        columns: 2,
      }),
    ).toEqual({
      rows: [
        { label: "温度", value: "26 ℃" },
        { label: "运行状态", value: "正常" },
      ],
      columns: 2,
      labelStyle: { fontSize: "13px", color: "#667085" },
      valueStyle: { fontSize: "16px", color: "#1677ff" },
    });
  });

  it("keeps placeholder text as a value-only row", () => {
    expect(buildInlinePropertyPanelModel({ displayBody: "（未绑定产品字段）" }).rows).toEqual([{ label: "", value: "（未绑定产品字段）" }]);
  });

  it("defaults to one column and clamps the configured column count", () => {
    expect(buildInlinePropertyPanelModel({}).columns).toBe(1);
    expect(buildInlinePropertyPanelModel({ columns: 0 }).columns).toBe(1);
    expect(buildInlinePropertyPanelModel({ columns: 3.4 }).columns).toBe(3);
    expect(buildInlinePropertyPanelModel({ columns: 9 }).columns).toBe(4);
  });
});
