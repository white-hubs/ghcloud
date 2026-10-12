import { describe, expect, test } from "bun:test";

import { ALARM_ATTACHMENT_MAX_COUNT, ALARM_OPINION_MAX_LENGTH } from "../src/constants/realtime";
import { createPositioningRepository } from "../src/mocks/positioning.repository";
import { createPositioningSeed } from "../src/mocks/positioning.seed";
import { createRealtimeRepository } from "../src/mocks/realtime.repository";
import { createRealtimeSeed } from "../src/mocks/realtime.seed";
import { alarmDuration, currentLocations, isOngoingAlarm, mapCoordinate, sortedAlarms } from "../src/utils/realtime";

describe("实时定位关联与告警", () => {
  test("处置校验失败时保留原状态，不写入处理记录", () => {
    const repo = createRealtimeRepository(createRealtimeSeed(createPositioningSeed()));
    const alarm = repo.state.alarms[0]!;
    expect(() => repo.operateAlarm(alarm.id, "confirm", "字".repeat(ALARM_OPINION_MAX_LENGTH + 1))).toThrow("处置意见");
    const attachments = Array.from({ length: ALARM_ATTACHMENT_MAX_COUNT + 1 }, (_, index) => ({
      id: String(index),
      name: "现场照片.png",
      url: "data:image/png;base64,dGVzdA==",
    }));
    expect(() => repo.operateAlarm(alarm.id, "confirm", "核实告警", "", attachments)).toThrow("附件");
    expect(alarm.state).toBe("pending");
    expect(alarm.operations).toHaveLength(0);
  });
  test("只显示有效绑定的最后位置；换绑、解绑和停用立即生效", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    expect(currentLocations(repo.state).find((item) => item.person.id === "P20260001")?.point.x).toBe(20);
    expect(currentLocations(repo.state).some((item) => item.person.id === "P20260012")).toBe(false);
    repo.bind("P20260001", "T20260020", "deviceFailure");
    expect(currentLocations(repo.state).some((item) => item.person.id === "P20260001")).toBe(false);
    repo.unbind("P20260002", "personnelAdjustment");
    expect(currentLocations(repo.state).some((item) => item.person.id === "P20260002")).toBe(false);
    repo.setDeviceEnabled("T20260003", false);
    expect(currentLocations(repo.state).some((item) => item.person.id === "P20260003")).toBe(false);
  });
  test("室外使用经纬度投影，非法坐标不落点", () => {
    const locations = currentLocations(createPositioningSeed());
    const outdoor = locations.find((item) => item.person.id === "P20260007")!;
    expect(outdoor.coordinate!.x).toBeCloseTo(40);
    expect(outdoor.coordinate!.y).toBeCloseTo(63);
    expect(mapCoordinate({ ...outdoor.point, longitude: 0 })).toBeNull();
    expect(locations.find((item) => item.person.id === "P20260004")?.coordinate).toBeNull();
  });
  test("进行中告警按等级和时间排序，已恢复告警排除", () => {
    const state = createRealtimeSeed(createPositioningSeed());
    const alarms = sortedAlarms(state.alarms.filter((alarm) => alarm.sceneId === "floor-10" && isOngoingAlarm(alarm)));
    expect(alarms.map((alarm) => alarm.id)).toEqual(["AL-20260908-003", "AL-20260908-001", "AL-20260908-002"]);
  });
  test("告警持续时间用发生时间计算，结束后冻结并处理异常时间", () => {
    const alarm = createRealtimeSeed(createPositioningSeed()).alarms[0]!;
    const start = Date.parse(alarm.occurredAt!);
    expect(alarmDuration(alarm, start + 59999)).toBe("少于1分钟");
    expect(alarmDuration(alarm, start + 125000)).toBe("2分钟");
    expect(alarmDuration({ ...alarm, occurredAt: null })).toBe("--");
    expect(alarmDuration({ ...alarm, recoveredAt: new Date(start - 1).toISOString() })).toBe("--");
    expect(alarmDuration({ ...alarm, closedAt: new Date(start + 60000).toISOString() }, start + 600000)).toBe("1分钟");
  });
  test("处置状态流转留痕，不改写历史人员、位置及第三方人数", () => {
    const repo = createRealtimeRepository(createRealtimeSeed(createPositioningSeed()));
    const alarm = repo.state.alarms[0]!;
    const event = {
      coordinate: { ...alarm.coordinate! },
      person: alarm.personName,
      occurredAt: alarm.occurredAt,
      actualValue: alarm.actualValue,
    };
    expect(() => repo.operateAlarm(alarm.id, "close", "直接关闭")).toThrow("不可用");
    expect(() => repo.operateAlarm(alarm.id, "confirm", " ")).toThrow("处置意见");
    repo.operateAlarm(alarm.id, "confirm", "核实告警");
    expect(() => repo.operateAlarm(alarm.id, "assign", "请处理")).toThrow("处置人");
    repo.operateAlarm(alarm.id, "assign", "请处理", "安保值班员");
    repo.operateAlarm(alarm.id, "progress", "已到场");
    repo.operateAlarm(alarm.id, "close", "现场处理完成");
    expect(isOngoingAlarm(alarm)).toBe(false);
    expect(alarm.operations).toHaveLength(4);
    expect({
      coordinate: alarm.coordinate,
      person: alarm.personName,
      occurredAt: alarm.occurredAt,
      actualValue: alarm.actualValue,
    }).toEqual(event);
  });
  test("误报关闭不改写触发事件，重复操作不能追加记录", () => {
    const repo = createRealtimeRepository(createRealtimeSeed(createPositioningSeed()));
    const alarm = repo.state.alarms[0]!;
    const occurredAt = alarm.occurredAt;
    repo.operateAlarm(alarm.id, "falseAlarm", "已核实为终端误触发");
    expect(alarm.state).toBe("closed");
    expect(isOngoingAlarm(alarm)).toBe(false);
    expect(alarm.occurredAt).toBe(occurredAt);
    expect(() => repo.operateAlarm(alarm.id, "confirm", "重复确认")).toThrow("不可用");
    expect(alarm.operations).toHaveLength(1);
  });
  test("附件随处置记录保存，之后编辑弹窗草稿不改变已提交记录", () => {
    const repo = createRealtimeRepository(createRealtimeSeed(createPositioningSeed()));
    const alarm = repo.state.alarms[0]!;
    const files = [{ id: "evidence-1", name: "现场照片.png", url: "data:image/png;base64,dGVzdA==" }];
    repo.operateAlarm(alarm.id, "confirm", "现场核实", "", files);
    files[0]!.name = "修改后的草稿.png";
    files.length = 0;
    expect(alarm.operations[0]!.attachments).toEqual([{ id: "evidence-1", name: "现场照片.png", url: "data:image/png;base64,dGVzdA==" }]);
  });
});
