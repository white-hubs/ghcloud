import type { DepartmentStat, TaskItem } from "@/types/dashboard";

export const overviewMock = {
  total: 36,
  done: 24,
  undone: 8,
  timeout: 4,
  completionRate: 67,
};

export const abnormalMock = {
  abnormalTask: 12,
  abnormalTaskTrend: 8,
  abnormalPoint: 21,
  abnormalPointTrend: -5,
};

export const taskTypeMock = [
  { name: "消防巡检", value: 10 },
  { name: "设备巡检", value: 9 },
  { name: "安全巡检", value: 7 },
  { name: "环境巡检", value: 6 },
  { name: "能耗巡检", value: 4 },
];

export const taskListMock: TaskItem[] = [
  {
    id: "t1",
    name: "1号楼消防巡检",
    patrolType: "消防巡检",
    patrolLevel: "一级",
    inspectionMode: "MANUAL",
    inspectionModeName: "常规巡检",
    objectCount: 18,
    status: "待接收",
    rawStatus: "ACCEPT",
    owner: "张三",
    ownerId: "u1",
    canTransfer: false,
    canTerminate: false,
  },
  {
    id: "t2",
    name: "地下车库机电巡检",
    patrolType: "设备巡检",
    patrolLevel: "二级",
    inspectionMode: "MANUAL",
    inspectionModeName: "常规巡检",
    objectCount: 9,
    status: "待巡检",
    rawStatus: "EXECUTING",
    owner: "李四",
    ownerId: "u2",
    canTransfer: true,
    canTerminate: true,
  },
  {
    id: "t3",
    name: "园区周界安全巡检",
    patrolType: "安全巡检",
    patrolLevel: "三级",
    inspectionMode: "MANUAL",
    inspectionModeName: "常规巡检",
    objectCount: 16,
    status: "已巡检",
    rawStatus: "OVER",
    owner: "王五",
    ownerId: "u3",
    canTransfer: false,
    canTerminate: false,
  },
  {
    id: "t4",
    name: "A区环境抽检",
    patrolType: "环境巡检",
    patrolLevel: "二级",
    inspectionMode: "MANUAL",
    inspectionModeName: "常规巡检",
    objectCount: 6,
    status: "已超时",
    rawStatus: "EXPIRE",
    owner: "赵六",
    ownerId: "u4",
    canTransfer: false,
    canTerminate: false,
  },
];

export const deptMock: DepartmentStat[] = [
  {
    id: "d1",
    name: "安保部",
    done: 12,
    total: 16,
    members: [
      { name: "张三", done: 4, total: 5 },
      { name: "李四", done: 3, total: 4 },
      { name: "王五", done: 5, total: 7 },
    ],
  },
  {
    id: "d2",
    name: "运维部",
    done: 8,
    total: 12,
    members: [
      { name: "赵六", done: 2, total: 4 },
      { name: "钱七", done: 6, total: 8 },
    ],
  },
];

export const layerPointCategories = ["设备", "档位", "资产", "现场点", "风险源", "小散工程"];
