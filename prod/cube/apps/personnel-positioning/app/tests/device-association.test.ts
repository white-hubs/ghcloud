import { describe, expect, test } from "bun:test";

import { createPositioningRepository } from "../src/mocks/positioning.repository";
import { createPositioningSeed } from "../src/mocks/positioning.seed";
import { toPositioningDevice } from "../src/utils/device-association";

const createRepo = () => createPositioningRepository(createPositioningSeed());
const terminal = () =>
  toPositioningDevice(
    {
      id: 33001,
      code: "LOC-33001",
      name: "定位终端一号",
      productInfo: { modelName: "MODEL-01", brandName: "设备品牌", productCategory: { code: "card" } },
      status: { onlineState: true },
    },
    "terminal",
  );

describe("公共设备选择结果关联", () => {
  test("保留设备中心 ID、编号及产品数据，不依赖假数据候选", () => {
    const record = terminal();
    expect(record).toMatchObject({
      id: "LOC-33001",
      sourceDeviceId: "33001",
      name: "定位终端一号",
      model: "MODEL-01",
      vendor: "设备品牌",
      online: "online",
      type: "card",
    });
    const station = toPositioningDevice({ id: "iot-9", name: "新基站", area: { pathName: "园区 / 生产楼" } }, "station");
    expect(station).toMatchObject({
      id: "iot-9",
      sourceDeviceId: "iot-9",
      kind: "station",
      type: "station",
      online: "pending",
      space: "园区 / 生产楼",
    });
    expect(() => toPositioningDevice({ id: "" }, "terminal")).toThrow("设备 ID");
  });
  test("确认关联更新统一档案，新增终端可用于人员绑定", () => {
    const repo = createRepo();
    const total = repo.state.devices.length;
    expect(repo.associateDevices("terminal", [terminal()])).toEqual({ added: 1, skipped: 0 });
    expect(repo.state.devices).toHaveLength(total + 1);
    repo.bind("P20260013", "LOC-33001");
    expect(repo.currentBinding("P20260013")?.terminalId).toBe("LOC-33001");
    const station = toPositioningDevice({ id: "new-station", code: "S-NEW" }, "station");
    expect(repo.associateDevices("station", [station]).added).toBe(1);
    expect(repo.state.devices.find((device) => device.id === "S-NEW")?.kind).toBe("station");
  });
  test("以公共设备 ID 去重，重复确认不覆盖已有状态或人员绑定", () => {
    const repo = createRepo();
    expect(repo.associateDevices("terminal", [terminal(), terminal()])).toEqual({ added: 1, skipped: 1 });
    repo.setDeviceEnabled("LOC-33001", false);
    const before = structuredClone(repo.state);
    const renamed = { ...terminal(), id: "NEW-CODE" };
    expect(repo.associateDevices("terminal", [renamed])).toEqual({ added: 0, skipped: 1 });
    expect(repo.state).toEqual(before);
  });
  test("不同设备使用相同编号或混入错误类型时整次失败，不部分写入", () => {
    const repo = createRepo();
    const before = structuredClone(repo.state);
    const collision = { ...terminal(), id: "T20260001", sourceDeviceId: "other-device" };
    expect(() => repo.associateDevices("terminal", [terminal(), collision])).toThrow("设备编号");
    const station = toPositioningDevice({ id: "station" }, "station");
    expect(() => repo.associateDevices("terminal", [terminal(), station])).toThrow("设备类型");
    expect(() => repo.associateDevices("terminal", [])).toThrow("至少选择");
    expect(repo.state).toEqual(before);
  });
  test("保存结果与选择草稿独立，关闭或再次编辑草稿不会改动已保存档案", () => {
    const repo = createRepo();
    const selected = terminal();
    repo.associateDevices("terminal", [selected]);
    selected.model = "修改后的草稿";
    selected.linkedStationIds.push("test");
    expect(repo.state.devices.find((device) => device.id === selected.id)).toMatchObject({ model: "MODEL-01", linkedStationIds: [] });
  });
});
