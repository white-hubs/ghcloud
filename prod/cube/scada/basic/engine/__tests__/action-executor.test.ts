import type { Action } from "@cube-scada/core";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ActionExecutor } from "../src/action/action-executor";
import { MockDriver } from "../src/binding/mock-driver";

describe("ActionExecutor", () => {
  let executor: ActionExecutor;
  let driver: MockDriver;

  beforeEach(() => {
    executor = new ActionExecutor();
    driver = new MockDriver({ flag: { type: "boolean" }, level: { type: "number" } });
  });

  describe("navigate", () => {
    it("calls navigate callback", async () => {
      const navigate = vi.fn();
      executor.setContext({ navigate });
      const action: Action = { type: "navigate", params: { pageId: "page-001" } };
      await executor.execute([action]);
      expect(navigate).toHaveBeenCalledWith("page-001");
    });

    it("does not throw when navigate is not set", async () => {
      const action: Action = { type: "navigate", params: { pageId: "page-001" } };
      await expect(executor.execute([action])).resolves.toBeUndefined();
    });
  });

  describe("setTag", () => {
    it("writes value to driver", async () => {
      executor.setContext({ driver });
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "setTag", params: { tag: "level", value: "75" } };
      await executor.execute([action]);
      expect(writeSpy).toHaveBeenCalledWith("level", "75");
    });

    it("skips when tag is empty", async () => {
      executor.setContext({ driver });
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "setTag", params: { tag: "", value: "1" } };
      await executor.execute([action]);
      expect(writeSpy).not.toHaveBeenCalled();
    });

    it("skips when driver is not set", async () => {
      const action: Action = { type: "setTag", params: { tag: "level", value: "1" } };
      await expect(executor.execute([action])).resolves.toBeUndefined();
    });
  });

  describe("toggleTag", () => {
    it("toggles boolean tag from false to true", async () => {
      executor.setContext({ driver });
      await driver.write("flag", false);
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "toggleTag", params: { tag: "flag", onValue: true, offValue: false } };
      await executor.execute([action]);
      expect(writeSpy).toHaveBeenCalledWith("flag", true);
    });

    it("toggles boolean tag from true to false", async () => {
      executor.setContext({ driver });
      await driver.write("flag", true);
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "toggleTag", params: { tag: "flag", onValue: true, offValue: false } };
      await executor.execute([action]);
      expect(writeSpy).toHaveBeenCalledWith("flag", false);
    });

    it("uses string equivalence for boolean-like values", async () => {
      executor.setContext({ driver });
      await driver.write("flag", "true");
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "toggleTag", params: { tag: "flag", onValue: "true", offValue: "false" } };
      await executor.execute([action]);
      expect(writeSpy).toHaveBeenCalledWith("flag", "false");
    });
  });

  describe("showPopup", () => {
    it("resolves element templates in showPopup params", async () => {
      const showPopup = vi.fn();
      executor.setContext({ showPopup });
      const action: Action = {
        type: "showPopup",
        params: { title: "${element.id}", message: "from-${element.type}" },
      };
      await executor.execute([action], {
        element: { id: "node-1", type: "pump", label: "P1", deviceId: "d1" },
      });
      expect(showPopup).toHaveBeenCalledWith(expect.objectContaining({ title: "node-1", message: "from-pump" }));
    });
  });

  describe("setElementVisibility", () => {
    it("sets the target element visibility", async () => {
      const setElementVisibility = vi.fn();
      executor.setContext({ setElementVisibility });
      const action: Action = {
        type: "setElementVisibility",
        params: { targetElementId: "target-1", visible: false },
      };

      await executor.execute([action]);

      expect(setElementVisibility).toHaveBeenCalledWith("target-1", false);
    });
  });

  describe("callApi", () => {
    it("calls fetch with correct url and method", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response("ok"));
      const action: Action = { type: "callApi", params: { url: "https://example.com/api", method: "POST" } };
      await executor.execute([action]);
      expect(fetchSpy).toHaveBeenCalledWith("https://example.com/api", expect.objectContaining({ method: "POST" }));
      fetchSpy.mockRestore();
    });

    it("defaults to GET when method not specified", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response("ok"));
      const action: Action = { type: "callApi", params: { url: "https://example.com/api" } };
      await executor.execute([action]);
      expect(fetchSpy).toHaveBeenCalledWith("https://example.com/api", expect.objectContaining({ method: "GET" }));
      fetchSpy.mockRestore();
    });

    it("does not throw on fetch failure", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
      const action: Action = { type: "callApi", params: { url: "https://fail.example.com" } };
      await expect(executor.execute([action])).resolves.toBeUndefined();
    });
  });

  describe("requireConfirm", () => {
    it("calls onActionRequest when requireConfirm is true", async () => {
      const onActionRequest = vi.fn().mockResolvedValue({ success: true });
      executor.setContext({ driver, onActionRequest });
      const action: Action = { type: "setTag", params: { tag: "level", value: "50" }, requireConfirm: true };
      await executor.execute([action]);
      expect(onActionRequest).toHaveBeenCalledOnce();
    });

    it("does NOT execute action when onActionRequest returns success=false", async () => {
      const onActionRequest = vi.fn().mockResolvedValue({ success: false, message: "Denied" });
      executor.setContext({ driver, onActionRequest });
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "setTag", params: { tag: "level", value: "50" }, requireConfirm: true };
      await executor.execute([action]);
      expect(writeSpy).not.toHaveBeenCalled();
    });

    it("executes action normally when requireConfirm is false", async () => {
      const onActionRequest = vi.fn().mockResolvedValue({ success: true });
      executor.setContext({ driver, onActionRequest });
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "setTag", params: { tag: "level", value: "50" }, requireConfirm: false };
      await executor.execute([action]);
      expect(onActionRequest).not.toHaveBeenCalled();
      expect(writeSpy).toHaveBeenCalled();
    });

    it("executes action even without onActionRequest when requireConfirm is true", async () => {
      executor.setContext({ driver });
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "setTag", params: { tag: "level", value: "50" }, requireConfirm: true };
      await executor.execute([action]);
      expect(writeSpy).toHaveBeenCalled();
    });
  });

  describe("global template resolution", () => {
    it("resolves ${global.xxx} in params", async () => {
      executor.setContext({ driver, globals: { deviceId: "DEV-001" } });
      const writeSpy = vi.spyOn(driver, "write");
      const action: Action = { type: "setTag", params: { tag: "level", value: "${global.deviceId}" } };
      await executor.execute([action]);
      expect(writeSpy).toHaveBeenCalledWith("level", "DEV-001");
    });
  });

  describe("unknown action type", () => {
    it("does not throw for unknown action types", async () => {
      const action = { type: "unknownType" as any, params: {} };
      await expect(executor.execute([action])).resolves.toBeUndefined();
    });
  });

  describe("execute multiple actions", () => {
    it("executes actions sequentially", async () => {
      const order: string[] = [];
      const navigate = vi.fn().mockImplementation(() => order.push("navigate"));
      const showPopup = vi.fn().mockImplementation(() => order.push("popup"));
      executor.setContext({ navigate, showPopup });

      await executor.execute([
        { type: "navigate", params: { pageId: "p1" } },
        { type: "showPopup", params: { message: "hi" } },
      ]);
      expect(order).toEqual(["navigate", "popup"]);
    });
  });
});
