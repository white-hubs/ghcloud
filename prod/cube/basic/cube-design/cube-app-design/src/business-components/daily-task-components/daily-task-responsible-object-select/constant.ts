export const ResponsibleObjectTypeOptions = [
  {
    label: "人员",
    value: "USER",
  },
  {
    label: "按条件多选",
    value: "CONDITION",
  },
];

// 参与类型常量
export const ParticipateType = {
  USER: "USER",
  DEPT: "DEPT",
  POST: "POST",
  ROLE: "ROLE",
  GRID_AREA: "GRID_AREA",
} as const;

export type ParticipateTypeValue = (typeof ParticipateType)[keyof typeof ParticipateType];
