import { Tag } from "ant-design-vue";

import type {
  CameraAiInspectionActionStatus,
  CameraAiInspectionTaskCameraStatus,
  CameraAiInspectionTaskStatus,
} from "@ghcloud/cube-service-interface/video-monitor";

import {
  ACTION_STATUS_COLOR,
  ACTION_STATUS_LABEL,
  TASK_CAMERA_STATUS_COLOR,
  TASK_CAMERA_STATUS_LABEL,
  TASK_STATUS_COLOR,
  TASK_STATUS_LABEL,
} from "@/constants/ai-inspection";

export const renderTaskStatusTag = (status?: CameraAiInspectionTaskStatus, timeout?: boolean) => {
  if (timeout) {
    return <Tag color="red">已超时</Tag>;
  }
  if (!status) {
    return <Tag>--</Tag>;
  }
  return <Tag color={TASK_STATUS_COLOR[status]}>{TASK_STATUS_LABEL[status]}</Tag>;
};

export const renderTaskCameraStatusTag = (status?: CameraAiInspectionTaskCameraStatus) => {
  if (!status) {
    return <Tag>--</Tag>;
  }
  return <Tag color={TASK_CAMERA_STATUS_COLOR[status]}>{TASK_CAMERA_STATUS_LABEL[status]}</Tag>;
};

export const renderActionStatusTag = (status?: CameraAiInspectionActionStatus) => {
  if (!status) {
    return <Tag>--</Tag>;
  }
  return <Tag color={ACTION_STATUS_COLOR[status]}>{ACTION_STATUS_LABEL[status]}</Tag>;
};
