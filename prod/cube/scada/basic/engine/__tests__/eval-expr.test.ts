import { describe, it, expect } from "vitest";

import { evalExpr, buildTagScope } from "../src/binding/eval-expr";

describe("evalExpr", () => {
  it("returns value unchanged when no expression logic", () => {
    expect(evalExpr("value", 42, {})).toBe(42);
  });

  it("supports ternary expression", () => {
    expect(evalExpr("value === 1 ? 'open' : 'closed'", 1, {})).toBe("open");
    expect(evalExpr("value === 1 ? 'open' : 'closed'", 0, {})).toBe("closed");
  });

  it("supports boolean coercion expression", () => {
    expect(evalExpr("value > 50", 60, {})).toBe(true);
    expect(evalExpr("value > 50", 40, {})).toBe(false);
  });

  it("supports arithmetic expression", () => {
    expect(evalExpr("value * 2", 5, {})).toBe(10);
    expect(evalExpr("value / 10", 100, {})).toBe(10);
  });

  it("supports string interpolation via template literal", () => {
    expect(evalExpr("`${value} RPM`", 1250, {})).toBe("1250 RPM");
  });

  it("returns original value on eval error", () => {
    expect(evalExpr("this_is_invalid_syntax ===", 42, {})).toBe(42);
  });

  it("can access tags object", () => {
    const tags = { speed: { value: 1250, quality: "good" as const, timestamp: 0 } };
    expect(evalExpr("tags.speed?.value ?? 0", 0, tags)).toBe(1250);
  });

  it("handles null/undefined value gracefully", () => {
    expect(evalExpr("value ?? 'default'", null, {})).toBe("default");
    expect(evalExpr("value ?? 0", undefined, {})).toBe(0);
  });

  it("caches compiled function across calls", () => {
    const expr = "value + 1";
    // Call multiple times with same expression to exercise cache path
    expect(evalExpr(expr, 1, {})).toBe(2);
    expect(evalExpr(expr, 5, {})).toBe(6);
    expect(evalExpr(expr, 10, {})).toBe(11);
  });
});

describe("buildTagScope", () => {
  it("builds nested scope from dotted tag names", () => {
    const scope = buildTagScope({
      "props.running": { value: true, quality: "good", timestamp: 0 },
      "props.num": { value: 75, quality: "good", timestamp: 0 },
    });
    expect(scope).toEqual({ props: { running: true, num: 75 } });
  });

  it("handles multi-segment paths", () => {
    const scope = buildTagScope({
      "PLC1.pump.status": { value: 1, quality: "good", timestamp: 0 },
    });
    expect(scope.PLC1.pump.status).toBe(1);
  });

  it("skips single-segment tag names", () => {
    const scope = buildTagScope({
      temperature: { value: 50, quality: "good", timestamp: 0 },
    });
    expect(Object.keys(scope)).toHaveLength(0);
  });

  it("merges multiple tags under same root", () => {
    const scope = buildTagScope({
      "PLC.a": { value: 1, quality: "good", timestamp: 0 },
      "PLC.b": { value: 2, quality: "good", timestamp: 0 },
    });
    expect(scope.PLC.a).toBe(1);
    expect(scope.PLC.b).toBe(2);
  });
});

describe("evalExpr with scope (path-style tag expressions)", () => {
  it("supports props.running style expression via scope", () => {
    const scopeTrue = buildTagScope({
      "props.running": { value: true, quality: "good", timestamp: 0 },
    });
    expect(evalExpr("props.running === true ? 'red' : 'green'", true, {}, scopeTrue)).toBe("red");

    const scopeFalse = buildTagScope({
      "props.running": { value: false, quality: "good", timestamp: 0 },
    });
    expect(evalExpr("props.running === true ? 'red' : 'green'", false, {}, scopeFalse)).toBe("green");
  });

  it("user example: circle fill based on props.running tag", () => {
    const tags = {
      "props.running": { value: true, quality: "good" as const, timestamp: 0 },
      "props.num": { value: 75, quality: "good" as const, timestamp: 0 },
    };
    const scope = buildTagScope(tags);
    // Exact expression from user's config
    expect(evalExpr("props.running === true ? 'red' : 'green'", true, tags, scope)).toBe("red");
  });

  it("returns value on exception even with scope (graceful fallback)", () => {
    expect(evalExpr("undefined_var.foo", "fallback", {}, {})).toBe("fallback");
  });
});
