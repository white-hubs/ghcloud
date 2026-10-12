import type { ElementInstance } from "@cube-scada/core";
import { describe, expect, it } from "vitest";

import {
  createPreviewDeviceValue,
  createPreviewDeviceValueReader,
  createPreviewPopupDeviceContext,
} from "../src/views/popup-preview-values";

describe("popup preview device values", () => {
  it("generates stable values from common property types and names", () => {
    expect(createPreviewDeviceValue({ propCode: "running", propName: "运行状态", dataType: "boolean" }, 0)).toBe(true);
    expect(createPreviewDeviceValue({ propCode: "temperature", propName: "温度", unitName: "℃" }, 1)).toBe(26.5);
    expect(createPreviewDeviceValue({ propCode: "remark", propName: "备注", dataType: "string" }, 2)).toBe("模拟值 3");
  });

  it("creates a reader for every bound device property", () => {
    const source = {
      propertyBindings: [
        { propCode: "speed", propName: "转速", unitName: "rpm" },
        { propCode: "pressure", propName: "压力", unitName: "MPa" },
      ],
    } as ElementInstance;
    const read = createPreviewDeviceValueReader(source);

    expect(read("speed")).toBe(1450);
    expect(read("pressure")).toBe(1.25);
    expect(read("missing")).toBeUndefined();
  });

  it("creates fallback label/value rows when only a property binding name is configured", () => {
    const source = {
      id: "ct-hub-1",
      label: "采集器图元",
      propertyBindName: "测试",
      deviceBinding: "required",
    } as ElementInstance;

    const context = createPreviewPopupDeviceContext(source);

    expect(context.source.propertyBindings?.map((item) => item.propName)).toEqual(["属性绑定名称", "运行状态", "模拟属性"]);
    expect(context.readValue("__preview_binding_name")).toBe("测试");
    expect(context.readValue("__preview_running")).toBe(true);
    expect(context.readValue("__preview_value")).toBe(26.5);
  });
});
