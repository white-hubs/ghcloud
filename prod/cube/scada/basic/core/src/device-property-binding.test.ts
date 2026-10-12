import { describe, expect, it } from "vitest";

import { isDevicePropertyTypeCompatible, normalizeDevicePropertyValueType } from "./device-property-binding";

describe("device property binding compatibility", () => {
  it("normalizes IoT product property data types", () => {
    expect(normalizeDevicePropertyValueType("double")).toBe("number");
    expect(normalizeDevicePropertyValueType("BOOLEAN")).toBe("boolean");
    expect(normalizeDevicePropertyValueType("varchar")).toBe("string");
    expect(normalizeDevicePropertyValueType(undefined)).toBe("unknown");
  });

  it("validates source and target property types", () => {
    expect(isDevicePropertyTypeCompatible("number", "float")).toBe(true);
    expect(isDevicePropertyTypeCompatible("number", "boolean")).toBe(false);
    expect(isDevicePropertyTypeCompatible("boolean", "bool")).toBe(true);
    expect(isDevicePropertyTypeCompatible("string", "int")).toBe(false);
    expect(isDevicePropertyTypeCompatible("color", "string")).toBe(true);
    expect(isDevicePropertyTypeCompatible("color", "double")).toBe(false);
    expect(isDevicePropertyTypeCompatible("select", "enum")).toBe(true);
    expect(isDevicePropertyTypeCompatible("number", undefined)).toBe(true);
  });
});
