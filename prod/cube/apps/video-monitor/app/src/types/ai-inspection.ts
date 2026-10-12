import type {
  CameraAiInspectionActionType,
  CameraAiInspectionCycleType,
  CameraAiInspectionExecutionMode,
  CameraAiInspectionWorkOrderFieldParam,
  VideoMonitorDeviceOption,
} from "@ghcloud/cube-service-interface/video-monitor";

export interface AiInspectionSelectedCamera extends VideoMonitorDeviceOption {
  algorithmId?: string;
  unavailable?: boolean;
}

export interface AiInspectionPlanCameraEditRow extends AiInspectionSelectedCamera {
  planCameraId?: string;
  sort?: number;
  actionRule?: AiInspectionActionRuleForm;
}

export interface AiInspectionActionRuleForm {
  enabled: boolean;
  actionType?: CameraAiInspectionActionType;
  confidenceThresholdPercent: number;
  emergencyRuleId?: string;
  workOrderTemplateId?: string;
  hiddenDangerObjectFieldKey?: string;
  sitePhotoFieldKey?: string;
  titleFieldKey?: string;
  descriptionFieldKey?: string;
}

export interface AiInspectionPlanFormState {
  name: string;
  principalUserId?: string;
  executionMode: CameraAiInspectionExecutionMode;
  cycleType?: CameraAiInspectionCycleType;
  cycleValues: string[];
  executeTime?: string;
  startTime?: string;
  endTime?: string;
  enabled: boolean;
  immediateExecute: boolean;
  taskLimitMinutes?: number;
  remark?: string;
}

export interface WorkOrderFieldOption {
  fieldKey: string;
  fieldName: string;
  fieldType?: string;
  required?: boolean;
}

export interface BuildWorkOrderFieldsOptions {
  fields: WorkOrderFieldOption[];
  rule: AiInspectionActionRuleForm;
}

export interface DeviceActionRuleMapping {
  deviceId: string;
  algorithmId: string;
  workOrderFields?: CameraAiInspectionWorkOrderFieldParam[];
}
