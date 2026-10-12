import { describe, it, expect, vi, beforeEach } from "vitest";

import { MockDriver } from "../src/binding/mock-driver";

describe("MockDriver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("calls callback immediately on subscribe", () => {
    const driver = new MockDriver({ temp: { type: "number", min: 0, max: 100 } });
    const cb = vi.fn();
    driver.subscribe(["temp"], cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("returns TagValue with quality=good and timestamp", () => {
    const driver = new MockDriver({ temp: { type: "number" } });
    const cb = vi.fn();
    driver.subscribe(["temp"], cb);
    const values = cb.mock.calls[0][0] as ReturnType<(typeof cb.mock.calls)[0][0]>;
    expect(values.temp.quality).toBe("good");
    expect(typeof values.temp.timestamp).toBe("number");
  });

  it("generates boolean values for boolean type", () => {
    const driver = new MockDriver({ running: { type: "boolean" } });
    const cb = vi.fn();
    driver.subscribe(["running"], cb);
    const values = cb.mock.calls[0][0];
    expect(typeof values.running.value).toBe("boolean");
  });

  it("generates string values for string type", () => {
    const driver = new MockDriver({ status: { type: "string" } });
    const cb = vi.fn();
    driver.subscribe(["status"], cb);
    const values = cb.mock.calls[0][0];
    expect(typeof values.status.value).toBe("string");
  });

  it("periodically pushes values after interval", () => {
    const driver = new MockDriver({}, 500);
    const cb = vi.fn();
    driver.subscribe(["tag1"], cb);
    expect(cb).toHaveBeenCalledTimes(1); // immediate
    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("unsubscribe stops interval", () => {
    const driver = new MockDriver({}, 500);
    const cb = vi.fn();
    const unsub = driver.subscribe(["tag1"], cb);
    unsub();
    vi.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(1); // only initial
  });

  it("write overrides value and pushes update", async () => {
    const driver = new MockDriver({ level: { type: "number" } });
    const cb = vi.fn();
    driver.subscribe(["level"], cb);
    cb.mockClear();

    await driver.write("level", 99);
    expect(cb).toHaveBeenCalledTimes(1);
    const values = cb.mock.calls[0][0];
    expect(values.level.value).toBe(99);
  });

  it("read returns current values", async () => {
    const driver = new MockDriver({ x: { type: "number" } });
    const result = await driver.read(["x"]);
    expect(result.x).toBeDefined();
    expect(typeof result.x.value).toBe("number");
  });

  it("reset clears overrides and pushes fresh values", async () => {
    const driver = new MockDriver({ flag: { type: "boolean" } });
    const cb = vi.fn();
    driver.subscribe(["flag"], cb);
    await driver.write("flag", true);
    cb.mockClear();

    driver.reset();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("selects from values array when provided", () => {
    const allowedValues = ["A", "B", "C"];
    const driver = new MockDriver({ mode: { values: allowedValues } });
    for (let i = 0; i < 20; i++) {
      const cb = vi.fn();
      driver.subscribe(["mode"], cb);
      const v = cb.mock.calls[0][0].mode.value;
      expect(allowedValues).toContain(v);
    }
  });
});
