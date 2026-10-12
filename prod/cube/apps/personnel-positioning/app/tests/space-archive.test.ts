import { describe, expect, test } from "bun:test";

import { FLOOR_PLAN_MAX_BYTES } from "../src/constants/space-archive";
import { createSpaceArchiveRepository } from "../src/mocks/space-archive.repository";
import { createSpaceArchiveSeed } from "../src/mocks/space-archive.seed";
import type { FloorPlanDraft, SpaceDraft } from "../src/models/space-archive";

const createRepo = () => createSpaceArchiveRepository(createSpaceArchiveSeed());
const roomDraft = (): SpaceDraft => ({
  parentId: "floor-10",
  kind: "room",
  code: "R1005",
  name: "培训室",
  usage: "会议室",
  floorNumber: null,
  enabled: true,
  remark: "新建房间",
});
const planDraft = (): FloorPlanDraft => ({
  floorId: "floor-09",
  fileName: "floor-9.png",
  size: 1024,
  url: "data:image/png;base64,dGVzdA==",
  version: "V1.0",
  remark: "初版",
  setCurrent: true,
});

describe("空间档案与图纸版本一致性", () => {
  test("新增遵循四级结构，编号去空格且全局唯一", () => {
    const repo = createRepo();
    const room = repo.saveNode({ ...roomDraft(), code: " R1005 ", name: " 培训室 " });
    expect(room.code).toBe("R1005");
    expect(repo.pathOf(room.id)).toBe("古河化工园区 / 生产管理区 / 数据对接楼 / 10层 / 培训室");
    expect(() => repo.saveNode({ ...roomDraft(), code: "r1005" })).toThrow("编号已存在");
    expect(() => repo.saveNode({ ...roomDraft(), parentId: "building-data" })).toThrow("层级");
    expect(() => repo.saveNode({ ...roomDraft(), parentId: "room-1001" })).toThrow("层级");
    expect(() => repo.saveNode({ ...roomDraft(), parentId: null })).toThrow("层级");
  });

  test("编辑保留关联和图纸版本，失败时不修改档案", () => {
    const repo = createRepo();
    const floor = repo.findNode("floor-10")!;
    repo.saveNode({ ...floor, name: "十楼办公区", remark: "更新备注", enabled: false }, floor.id);
    expect(repo.currentPlan(floor.id)?.version).toBe("V5.0");
    expect(floor.references).toEqual(["人员定位：10层定位基站"]);
    const before = structuredClone(floor);
    expect(() => repo.saveNode({ ...floor, parentId: "building-workshop" }, floor.id)).toThrow("不能改变");
    expect(() => repo.saveNode({ ...floor, code: "AREA-01" }, floor.id)).toThrow("编号已存在");
    expect(floor).toEqual(before);
  });

  test("同楼栋实际层数唯一，地下层合法，零层和小数非法", () => {
    const repo = createRepo();
    const floor: SpaceDraft = { ...roomDraft(), parentId: "building-data", kind: "floor", code: "B01", name: "地下1层", floorNumber: -1 };
    expect(repo.saveNode(floor).floorNumber).toBe(-1);
    expect(() => repo.saveNode({ ...floor, code: "B02" })).toThrow("相同实际层数");
    expect(() => repo.saveNode({ ...floor, code: "F00", floorNumber: 0 })).toThrow("非零整数");
    expect(() => repo.saveNode({ ...floor, code: "F01", floorNumber: 1.5 })).toThrow("非零整数");
  });

  test("有子节点或业务引用的空间不能删除，空楼层删除清理图纸", () => {
    const repo = createRepo();
    expect(() => repo.deleteNode("floor-10")).toThrow("子节点");
    expect(() => repo.deleteNode("room-1003")).toThrow("业务引用");
    repo.addPlan(planDraft());
    repo.deleteNode("floor-09");
    expect(repo.findNode("floor-09")).toBeUndefined();
    expect(repo.plansFor("floor-09")).toHaveLength(0);
    repo.deleteNode("room-1001");
    expect(repo.children("floor-10")).toHaveLength(3);
  });

  test("上传历史版不改变当前图纸，激活版本只影响所属楼层", () => {
    const repo = createRepo();
    const first = repo.addPlan(planDraft());
    const second = repo.addPlan({ ...planDraft(), version: "V2.0", fileName: "floor-9-v2.dwg", setCurrent: false });
    expect(repo.currentPlan("floor-09")?.id).toBe(first.id);
    expect(repo.plansFor("floor-09").map((plan) => plan.id)).toEqual([second.id, first.id]);
    repo.activatePlan("floor-09", second.id);
    expect(repo.currentPlan("floor-09")?.id).toBe(second.id);
    expect(repo.currentPlan("floor-10")?.version).toBe("V5.0");
    expect(() => repo.activatePlan("floor-10", second.id)).toThrow("不属于当前楼层");
    repo.activatePlan("floor-09", first.id);
    expect(repo.currentPlan("floor-09")?.id).toBe(first.id);
  });

  test("首版可仅存档；重复版本、不支持的文件及非楼层上传不污染状态", () => {
    const repo = createRepo();
    repo.addPlan({ ...planDraft(), setCurrent: false });
    expect(repo.currentPlan("floor-09")).toBeUndefined();
    const before = structuredClone(repo.state);
    expect(() => repo.addPlan({ ...planDraft(), version: " v1.0 " })).toThrow("相同版本号");
    expect(() => repo.addPlan({ ...planDraft(), floorId: "room-1001" })).toThrow("只有楼层");
    expect(() => repo.addPlan({ ...planDraft(), fileName: "invalid.html" })).toThrow("请选择");
    expect(() => repo.addPlan({ ...planDraft(), size: FLOOR_PLAN_MAX_BYTES + 1 })).toThrow("20 MB");
    expect(() => repo.addPlan({ ...planDraft(), size: 0 })).toThrow("不能为空");
    expect(() => repo.addPlan({ ...planDraft(), url: "" })).toThrow("尚未读取");
    expect(repo.state).toEqual(before);
  });
});
