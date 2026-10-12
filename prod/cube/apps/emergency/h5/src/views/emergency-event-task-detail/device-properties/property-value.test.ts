import { expect, test } from "bun:test";

import { commandPropertyValue, displayPropertyValue } from "./property-value";

const numeric = { propCode: "target", dataType: "float", dataWrite: 1, precision: 2, dataConfig: "[0,100]" };

test("zero and false are displayed rather than replaced by empty placeholders", () => {
  expect(displayPropertyValue(numeric, 0)).toBe("0");
  expect(displayPropertyValue(numeric, false)).toBe("false");
  expect(displayPropertyValue(numeric)).toBe("—");
});

test("rejects read-only, missing and unsupported property definitions", () => {
  expect(() => commandPropertyValue({ ...numeric, dataWrite: 0 }, "10")).toThrow("不可写");
  expect(() => commandPropertyValue({ ...numeric, dataType: "struct" }, "{}")).toThrow("暂不支持");
});

test("validates numeric bounds and precision without silently changing commands", () => {
  expect(commandPropertyValue(numeric, "0")).toBe("0");
  expect(commandPropertyValue(numeric, "12.34")).toBe("12.34");
  for (const value of ["", " ", "NaN", "Infinity", "0x10", "-1", "101", "1.234"]) {
    expect(() => commandPropertyValue(numeric, value)).toThrow();
  }
  expect(() => commandPropertyValue({ ...numeric, dataType: "int" }, "1.5")).toThrow("整数");
  expect(() => commandPropertyValue({ ...numeric, dataType: "long", dataConfig: "[]" }, "9007199254740993")).toThrow("精度范围");
});

test("enum and boolean commands use configured raw values", () => {
  const property = { ...numeric, dataType: "boolean", dataConfig: '[{"value":0,"label":"关闭"},{"value":1,"label":"开启"}]' };
  expect(commandPropertyValue(property, "0")).toBe("0");
  expect(displayPropertyValue(property, 0)).toBe("关闭");
  expect(() => commandPropertyValue(property, "2")).toThrow("有效");
  expect(() => commandPropertyValue({ ...property, dataConfig: "invalid" }, "0")).toThrow();
});
