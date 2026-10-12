import type { SpaceArchiveState, SpaceDraft, SpaceNode } from "../models/space-archive";

export function createSpaceArchiveSeed(): SpaceArchiveState {
  const timestamp = "2026-08-24T09:30:00+08:00";
  function node(
    id: string,
    parentId: string | null,
    kind: SpaceDraft["kind"],
    code: string,
    name: string,
    extra: Partial<SpaceNode> = {},
  ): SpaceNode {
    return {
      id,
      parentId,
      kind,
      code,
      name,
      usage: "",
      floorNumber: null,
      enabled: true,
      remark: "",
      references: [],
      currentPlanId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...extra,
    };
  }
  return {
    nodes: [
      node("area-production", null, "area", "AREA-01", "生产管理区", { usage: "生产与办公", remark: "园区生产及配套办公空间" }),
      node("building-data", "area-production", "building", "BLD-001", "数据对接楼", { usage: "综合办公" }),
      node("floor-10", "building-data", "floor", "F10", "10层", {
        floorNumber: 10,
        currentPlanId: "plan-demo-v5",
        references: ["人员定位：10层定位基站"],
      }),
      node("room-1001", "floor-10", "room", "R1001", "办公室", { usage: "办公室" }),
      node("room-1002", "floor-10", "room", "R1002", "会议室", { usage: "会议室" }),
      node("room-1003", "floor-10", "room", "R1003", "机房", { usage: "设备用房", references: ["设备档案：机房配电柜"] }),
      node("room-1004", "floor-10", "room", "R1004", "公共走廊", { usage: "公共区域" }),
      node("floor-09", "building-data", "floor", "F09", "9层", { floorNumber: 9 }),
      node("building-workshop", "area-production", "building", "BLD-002", "一号车间", { usage: "生产车间" }),
      node("area-service", null, "area", "AREA-02", "生活服务区", { usage: "生活配套", enabled: false, remark: "规划中，暂未投入使用" }),
    ],
    plans: [
      {
        id: "plan-demo-v5",
        floorId: "floor-10",
        fileName: "10F-layout-v5.svg",
        size: 2400,
        url: new URL("../assets/floor-plan-demo.svg", import.meta.url).href,
        version: "V5.0",
        remark: "演示平面图，仅用于空间档案预览",
        uploadedAt: timestamp,
      },
    ],
  };
}
