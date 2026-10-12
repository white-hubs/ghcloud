export const TRAJECTORY_EVENT_TYPES = {
  enter: { label: "进入场景", color: "green" },
  leave: { label: "离开场景", color: "blue" },
  switch: { label: "楼层切换", color: "purple" },
  alarm: { label: "关联告警", color: "red" },
  gap: { label: "暂无轨迹数据", color: "default" },
  position: { label: "位置详情", color: "blue" },
} as const;
export const TRAJECTORY_SPEEDS = [0.5, 1, 2, 4, 8] as const;
/** 演示采样间隔为8分钟。此值仅决定示意折线是否连接，不判定定位中断。 */
export const TRAJECTORY_GAP_MS = 15 * 60 * 1000;
