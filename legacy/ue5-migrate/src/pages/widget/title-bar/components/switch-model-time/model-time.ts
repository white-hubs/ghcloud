/** UE5 标题栏时间选项 + AI commandValue 别名（与 SwitchModelTime 下拉一致） */
export const modelTimeList = [
  {
    label: "自动",
    value: "auto",
    commandValue: "auto",
    img: "time1.png",
  },
  {
    label: "上午",
    value: "9:00:00",
    commandValue: "morning",
    img: "time1.png",
  },
  {
    label: "下午",
    value: "15:00:00",
    commandValue: "afternoon",
    img: "time2.png",
  },
  {
    label: "晚上",
    value: "22:00:00",
    commandValue: "evening",
    img: "time3.png",
  },
  // 兼容旧技能枚举 day / dusk / night
  {
    label: "上午",
    value: "9:00:00",
    commandValue: "day",
    img: "time1.png",
  },
  {
    label: "晚上",
    value: "22:00:00",
    commandValue: "night",
    img: "time3.png",
  },
  {
    label: "黄昏",
    value: "18:00:00",
    commandValue: "dusk",
    img: "time2.png",
  },
];
