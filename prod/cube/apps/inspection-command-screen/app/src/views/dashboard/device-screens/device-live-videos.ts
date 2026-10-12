import type { DeviceInspectionTaskData } from "@/api/dashboard-service";

const VIDEO_BASE = "https://r.kaiheai.com/20260709tmp";
const DRONE_VIDEO_URLS = [
  `${VIDEO_BASE}/drone-1.mp4`,
  `${VIDEO_BASE}/drone-1.mp4`,
  `${VIDEO_BASE}/drone-3.mp4`,
  `${VIDEO_BASE}/drone-alarm-helmet.mp4`,
];
const ROBOT_DOG_VIDEO_URL = `${VIDEO_BASE}/VID_20260709_162714.mp4`;

const isPlayableTask = (task: DeviceInspectionTaskData | null | undefined): task is DeviceInspectionTaskData => {
  return Boolean(task && task.status !== "待巡检");
};

export const resolveDroneTaskVideoUrl = (task: DeviceInspectionTaskData | null | undefined, tasks: DeviceInspectionTaskData[]): string => {
  if (!isPlayableTask(task)) {
    return "";
  }
  const taskIndex = Math.max(
    0,
    tasks.findIndex((item) => item.id === task.id),
  );
  return DRONE_VIDEO_URLS[taskIndex % DRONE_VIDEO_URLS.length];
};

export const resolveRobotDogTaskVideoUrl = (task: DeviceInspectionTaskData | null | undefined): string => {
  return isPlayableTask(task) ? ROBOT_DOG_VIDEO_URL : "";
};

export const shouldShowDeviceLiveModal = (task: DeviceInspectionTaskData | null | undefined): boolean => {
  return isPlayableTask(task);
};
