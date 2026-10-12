import { describe, expect, test } from "bun:test";

import { resolveModelQualityOption } from "./model-quality";

describe("resolveModelQualityOption", () => {
  test("maps high/medium/low with labels", () => {
    expect(resolveModelQualityOption("high")).toEqual({ value: "high", label: "高" });
    expect(resolveModelQualityOption("MEDIUM")).toEqual({ value: "medium", label: "中" });
    expect(resolveModelQualityOption("low")).toEqual({ value: "low", label: "低" });
  });

  test("maps Chinese labels", () => {
    expect(resolveModelQualityOption("高")?.value).toBe("high");
    expect(resolveModelQualityOption("中")?.value).toBe("medium");
  });

  test("accepts params object with only value", () => {
    expect(resolveModelQualityOption({ value: "high" })).toEqual({ value: "high", label: "高" });
  });
});
