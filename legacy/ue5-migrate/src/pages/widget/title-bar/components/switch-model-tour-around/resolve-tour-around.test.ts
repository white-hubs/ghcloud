import { describe, expect, test } from "bun:test";

import { resolveTourAroundDesired } from "./resolve-tour-around";

describe("resolveTourAroundDesired", () => {
  test("defaults to open when missing", () => {
    expect(resolveTourAroundDesired(undefined)).toBe(true);
    expect(resolveTourAroundDesired(null)).toBe(true);
    expect(resolveTourAroundDesired({})).toBe(true);
  });

  test("reads boolean and common aliases", () => {
    expect(resolveTourAroundDesired(true)).toBe(true);
    expect(resolveTourAroundDesired(false)).toBe(false);
    expect(resolveTourAroundDesired({ value: true })).toBe(true);
    expect(resolveTourAroundDesired({ value: false })).toBe(false);
    expect(resolveTourAroundDesired({ value: "关闭" })).toBe(false);
    expect(resolveTourAroundDesired({ value: "开启" })).toBe(true);
    expect(resolveTourAroundDesired({ value: "off" })).toBe(false);
  });
});
