import { describe, expect, test } from "bun:test";

import { hasArgsPreview, isGrantExpired, mapScopeHintToChoice, remainingSeconds } from "./assistant-consent";

describe("mapScopeHintToChoice", () => {
  test("preselects ONCE when engine recommends ONCE (each-call policy)", () => {
    expect(mapScopeHintToChoice("ONCE")).toBe("ONCE");
  });

  test("preselects PERSISTENT when engine recommends PERSISTENT (on-first-use policy)", () => {
    expect(mapScopeHintToChoice("PERSISTENT")).toBe("PERSISTENT");
  });

  test("defaults to SESSION when no hint is provided", () => {
    expect(mapScopeHintToChoice(undefined)).toBe("SESSION");
  });
});

describe("isGrantExpired", () => {
  test("considers a grant expired when current time equals expiresTime", () => {
    expect(isGrantExpired(1000, 1000)).toBe(true);
  });

  test("considers a grant expired when current time is past expiresTime", () => {
    expect(isGrantExpired(1000, 2000)).toBe(true);
  });

  test("considers a grant active when current time is before expiresTime", () => {
    expect(isGrantExpired(2000, 1000)).toBe(false);
  });
});

describe("remainingSeconds", () => {
  test("returns full remaining seconds when well before expiry", () => {
    expect(remainingSeconds(60_000, 0)).toBe(60);
  });

  test("returns 0 instead of negative when already expired", () => {
    expect(remainingSeconds(1000, 2000)).toBe(0);
  });

  test("rounds down to nearest second", () => {
    // 29_500 ms remaining → 29 full seconds
    expect(remainingSeconds(30_000, 500)).toBe(29);
  });
});

describe("hasArgsPreview", () => {
  test("returns false for empty object (current engine placeholder)", () => {
    expect(hasArgsPreview({})).toBe(false);
  });

  test("returns false when undefined", () => {
    expect(hasArgsPreview(undefined)).toBe(false);
  });

  test("returns true when preview has at least one key", () => {
    expect(hasArgsPreview({ flowId: "abc" })).toBe(true);
  });
});
