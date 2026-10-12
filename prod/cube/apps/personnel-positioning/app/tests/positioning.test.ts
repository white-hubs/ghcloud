import { describe, expect, test } from "bun:test";

import { createPositioningRepository } from "../src/mocks/positioning.repository";
import { createPositioningSeed, sourcePeople, providerDevices } from "../src/mocks/positioning.seed";

describe("人员与终端业务一致性", () => {
  test("重复同步同一来源人员不产生重复定位对象", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    const ids = sourcePeople.map((person) => person.sourceId);
    repo.syncPeople(ids);
    const count = repo.state.persons.length;
    expect(repo.syncPeople(ids).added).toBe(0);
    expect(repo.state.persons.length).toBe(count);
  });
  test("换绑结束旧绑定，失败换绑保持原关系", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    const old = repo.currentBinding("P20260001")!;
    expect(() => repo.bind("P20260001", "T20260002")).toThrow("已被占用");
    expect(repo.currentBinding("P20260001")?.id).toBe(old.id);
    expect(() => repo.bind("P20260001", "T20260020")).toThrow("请选择更换原因");
    repo.bind("P20260001", "T20260020", "deviceFailure");
    expect(old.endedAt).not.toBeNull();
    expect(old.endReason).toBe("deviceFailure");
    expect(repo.currentBinding("P20260001")?.terminalId).toBe("T20260020");
    expect(repo.currentBinding("P20260001")?.actionReason).toBe("deviceFailure");
    expect(repo.state.bindings.filter((item) => item.personId === "P20260001" && item.endedAt === null)).toHaveLength(1);
  });
  test("解绑保留历史，重复解绑不会新增记录", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    const count = repo.state.bindings.length;
    expect(() => repo.unbind("P20260001", "" as never)).toThrow("请选择解绑原因");
    repo.unbind("P20260001", "personnelAdjustment");
    expect(repo.currentBinding("P20260001")).toBeUndefined();
    expect(repo.state.bindings.length).toBe(count);
    expect(repo.history("P20260001").some((item) => item.endedAt !== null && item.endReason === "personnelAdjustment")).toBe(true);
    expect(() => repo.unbind("P20260001", "personnelAdjustment")).toThrow("未绑定");
  });
  test("已占用、停用终端和基站不能新绑定", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    repo.setDeviceEnabled("T20260020", false);
    expect(() => repo.bind("P20260013", "T20260020")).toThrow("停用");
    expect(() => repo.bind("P20260013", "T20260001")).toThrow("已被占用");
    expect(() => repo.bind("P20260013", "S20260001")).toThrow("定位终端");
  });
  test("停用及第三方同步保留平台启停状态和历史关系", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    repo.setDeviceEnabled("T20260001", false);
    repo.syncDevices("terminal", providerDevices);
    expect(repo.state.devices.find((item) => item.id === "T20260001")?.enabled).toBe(false);
    expect(repo.currentBinding("P20260001")?.terminalId).toBe("T20260001");
    const total = repo.state.devices.length;
    expect(repo.syncDevices("terminal", providerDevices).added).toBe(0);
    expect(repo.state.devices.length).toBe(total);
  });
  test("同步失败保留原设备，可再次同步成功", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    const before = structuredClone(repo.state.devices.find((item) => item.id === "T20260001"));
    const invalid = { ...providerDevices[0]!, model: "" };
    expect(repo.syncDevices("terminal", [invalid]).failed).toBe(1);
    expect(repo.state.devices.find((item) => item.id === "T20260001")).toEqual(before);
    expect(repo.syncDevices("terminal", [providerDevices[0]!]).failed).toBe(0);
  });
  test("网关档案与基站关联保持设备关系唯一", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    const gateway = repo.saveGateway({ id: "GW-004", type: "edgeGateway", model: "EDGE-GW300", space: "二号仓库 · 弱电间" });
    expect(gateway.gatewayState).toBe("undeployed");
    repo.setGatewayStations(gateway.id, ["S20260008"]);
    expect(gateway.linkedStationIds).toEqual(["S20260008"]);
    expect(gateway.gatewayState).toBe("running");
    expect(() => repo.setGatewayStations("GW-001", ["S20260008"])).toThrow("已关联至 GW-004");
    expect(() => repo.saveGateway({ id: "GW-004", type: "gateway", model: "LOC-GW100", space: "设备库" })).toThrow("设备编号已存在");
  });
});
