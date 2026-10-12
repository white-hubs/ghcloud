import type { ElementInstance } from "@cube-scada/core";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { BindingEngine } from "../src/binding/binding-engine";
import { MockDriver } from "../src/binding/mock-driver";

// Minimal element instance factory
function makeInstance(id: string, bindings: ElementInstance["bindings"] = []): ElementInstance {
  return {
    id,
    type: "rect",
    label: undefined,
    deviceId: undefined,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {},
    bindings,
    eventHandlers: [],
  };
}

describe("BindingEngine", () => {
  let engine: BindingEngine;
  let driver: MockDriver;

  beforeEach(() => {
    engine = new BindingEngine();
    driver = new MockDriver({ temp: { type: "number", min: 20, max: 80 } }, 999999);
    engine.setDriver(driver);
  });

  describe("setDriver / getDriver", () => {
    it("stores and returns driver", () => {
      expect(engine.getDriver()).toBe(driver);
    });

    it("accepts null driver", () => {
      engine.setDriver(null as any);
      expect(engine.getDriver()).toBeNull();
    });
  });

  describe("setGlobals", () => {
    it("stores globals for template resolution", () => {
      engine.setGlobals({ deviceId: "DEV-001" });
      // Verify via bind — tag template `${global.deviceId}` should resolve
      const subscribeSpy = vi.spyOn(driver, "subscribe");
      const inst = makeInstance("e1", [{ id: "b1", propName: "running", tagName: "${global.deviceId}.running" }]);
      engine.bind([inst]);
      // subscribe should have been called with the resolved tag
      expect(subscribeSpy).toHaveBeenCalledWith(expect.arrayContaining(["DEV-001.running"]), expect.any(Function));
    });
  });

  describe("bind", () => {
    it("returns an unsubscribe function", () => {
      const inst = makeInstance("e1", [{ id: "b1", propName: "value", tagName: "temp" }]);
      const unsub = engine.bind([inst]);
      expect(typeof unsub).toBe("function");
    });

    it("populates store with tag values", () => {
      const inst = makeInstance("e1", [{ id: "b1", propName: "level", tagName: "temp" }]);
      engine.bind([inst]);
      const props = engine.getProps("e1");
      expect(props).toBeDefined();
      expect(typeof props!.level).toBe("number");
    });

    it("returns no-op unsub when no driver set", () => {
      const noDriverEngine = new BindingEngine();
      const inst = makeInstance("e1", [{ id: "b1", propName: "v", tagName: "t" }]);
      const unsub = noDriverEngine.bind([inst]);
      expect(() => unsub()).not.toThrow();
    });

    it("returns no-op unsub when no bindings", () => {
      const inst = makeInstance("e1", []);
      const unsub = engine.bind([inst]);
      expect(() => unsub()).not.toThrow();
    });

    it("applies transform expression", () => {
      const specificDriver = new MockDriver({});
      const subscribeSpy = vi.spyOn(specificDriver, "subscribe").mockImplementation((tags, cb) => {
        cb({ temp: { value: 1, quality: "good", timestamp: 0 } });
        return () => {};
      });
      engine.setDriver(specificDriver);

      const inst = makeInstance("e1", [{ id: "b1", propName: "status", tagName: "temp", transform: "value === 1 ? 'open' : 'closed'" }]);
      engine.bind([inst]);
      expect(engine.getProps("e1")?.status).toBe("open");
      subscribeSpy.mockRestore();
    });

    it("handles alias resolution", () => {
      const subscribeSpy = vi.spyOn(driver, "subscribe");
      const inst = makeInstance("e1", [{ id: "b1", propName: "val", tagName: "myAlias" }]);
      engine.bind([inst], [{ alias: "myAlias", tagName: "temp" }]);
      expect(subscribeSpy).toHaveBeenCalledWith(expect.arrayContaining(["temp"]), expect.any(Function));
    });
  });

  describe("getStore / clearStore", () => {
    it("getStore returns reactive object", () => {
      const store = engine.getStore();
      expect(typeof store).toBe("object");
    });

    it("clearStore removes all entries", () => {
      const inst = makeInstance("e1", [{ id: "b1", propName: "v", tagName: "temp" }]);
      engine.bind([inst]);
      expect(engine.getProps("e1")).toBeDefined();
      engine.clearStore();
      expect(engine.getProps("e1")).toBeUndefined();
    });
  });

  describe("dispose", () => {
    it("disposes without error", () => {
      const inst = makeInstance("e1", [{ id: "b1", propName: "v", tagName: "temp" }]);
      engine.bind([inst]);
      expect(() => engine.dispose()).not.toThrow();
    });

    it("stops receiving updates after dispose", () => {
      const mockDrv = new MockDriver({}, 100);
      const engineLocal = new BindingEngine();
      engineLocal.setDriver(mockDrv);

      const inst = makeInstance("e1", [{ id: "b1", propName: "v", tagName: "t1" }]);
      engineLocal.bind([inst]);
      engineLocal.clearStore();
      engineLocal.dispose();

      // store should remain empty after dispose
      expect(engineLocal.getProps("e1")).toBeUndefined();
    });
  });
});
