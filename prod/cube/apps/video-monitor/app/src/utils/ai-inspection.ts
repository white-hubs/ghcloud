import dayjs, { type Dayjs } from "dayjs";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import { CubeMessageEvent } from "@ghcloud/cube-protocol";
import type {
  AiInspectionWorkOrderTemplate,
  AiInspectionWorkOrderTemplateField,
  CameraAiInspectionEvent,
  CameraAiInspectionPlan,
  CameraAiInspectionActionRuleParam,
  CameraAiInspectionPlanModifyParam,
} from "@ghcloud/cube-service-interface/video-monitor";
import {
  CameraAiInspectionActionType,
  CameraAiInspectionCycleType,
  CameraAiInspectionExecutionMode,
} from "@ghcloud/cube-service-interface/video-monitor";
import { getEnvironment } from "@ghcloud/cube-utils";

import { CYCLE_TYPE_LABEL, EXECUTION_MODE_LABEL, WEEK_OPTIONS } from "@/constants/ai-inspection";
import type {
  AiInspectionPlanFormState,
  AiInspectionActionRuleForm,
  AiInspectionSelectedCamera,
  BuildWorkOrderFieldsOptions,
  WorkOrderFieldOption,
} from "@/types/ai-inspection";

export type AiInspectionDateTimeValue = string | number | Dayjs | null | undefined;

const ACTION_TARGET_APPLICATION_CODE: Record<CameraAiInspectionActionType, string> = {
  [CameraAiInspectionActionType.ALARM]: "SECURITY_MONITORING",
  [CameraAiInspectionActionType.WORK_ORDER]: "HAZARD_GOVERNANCE",
};

const toDateTimeDayjs = (value: AiInspectionDateTimeValue): Dayjs | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (dayjs.isDayjs(value)) {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? dayjs(value) : null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const timestamp = Number(trimmed);
  const parsed = Number.isFinite(timestamp) && /^\d{10,}$/.test(trimmed) ? dayjs(timestamp) : dayjs(trimmed);
  return parsed.isValid() ? parsed : null;
};

export const normalizeDateTimeValue = (value: AiInspectionDateTimeValue): string | undefined => {
  const parsed = toDateTimeDayjs(value);
  return parsed?.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : undefined;
};

export const formatDateTime = (value: AiInspectionDateTimeValue): string => {
  const parsed = toDateTimeDayjs(value);
  return parsed?.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : "--";
};

export const formatPercent = (value?: number): string => (typeof value === "number" ? `${Math.round(value * 10000) / 100}%` : "--");

export const formatExecutionPlan = (record: CameraAiInspectionPlan): string => {
  const mode = record.executionMode ? EXECUTION_MODE_LABEL[record.executionMode] : "--";
  if (record.executionMode === CameraAiInspectionExecutionMode.ONCE) {
    return `${mode} ${formatDateTime(record.startTime)}`;
  }
  const cycle = record.cycleType ? CYCLE_TYPE_LABEL[record.cycleType] : "";
  const cycleValues = formatCycleValues(record.cycleType, record.cycleValues);
  return [mode, cycle, cycleValues, record.executeTime].filter(Boolean).join(" ");
};

export const formatCycleValues = (cycleType?: CameraAiInspectionCycleType, cycleValues?: string): string => {
  if (!cycleValues || cycleType === CameraAiInspectionCycleType.EVERY_DAY) {
    return "";
  }
  if (cycleType === CameraAiInspectionCycleType.EVERY_WEEK) {
    const weekLabelMap = new Map<string, string>(WEEK_OPTIONS.map((item) => [item.value, item.label]));
    return cycleValues
      .split(",")
      .map((item) => weekLabelMap.get(item) ?? item)
      .join("、");
  }
  return cycleValues
    .split(",")
    .map((item) => `${item}日`)
    .join("、");
};

export const buildAlarmDetailUrl = (event: CameraAiInspectionEvent): string => {
  const query = new URLSearchParams({
    businessKey: event.id,
    alarmStatus: "ALARM_UN_CONFIRMED",
    type: "detail",
    id: event.actionTargetId ?? "",
  });
  return `/portal/genericEquipmentMonitor/alarmDetail?${query.toString()}`;
};

export const buildHazardLedgerDetailUrl = (event: CameraAiInspectionEvent): string => {
  const query = new URLSearchParams({
    id: event.actionTargetId ?? "",
  });
  return `/portal/hazard-governance/hazard-ledger-detail?${query.toString()}`;
};

const openBusinessPage = (applicationCode: string, url: string): void => {
  const environment = getEnvironment();
  if (environment === "cubeDesktopClient" || environment === "iframe") {
    window.parent.postMessage(
      {
        type: CubeMessageEvent.TO_BUSINESS_PAGE,
        data: {
          code: applicationCode,
          path: url,
        },
      },
      "*",
    );
    return;
  }

  // Notify the host so current application/menu state follows the cross-app page.
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, {
      code: applicationCode,
      path: url,
    });
    return;
  }

  history.pushState({ current: location.pathname + location.search }, "", url);
};

export const openActionTarget = (event: CameraAiInspectionEvent): void => {
  if (!event.actionTargetId) {
    return;
  }
  const actionType =
    event.actionType === CameraAiInspectionActionType.WORK_ORDER
      ? CameraAiInspectionActionType.WORK_ORDER
      : CameraAiInspectionActionType.ALARM;
  const url = actionType === CameraAiInspectionActionType.WORK_ORDER ? buildHazardLedgerDetailUrl(event) : buildAlarmDetailUrl(event);
  openBusinessPage(ACTION_TARGET_APPLICATION_CODE[actionType], url);
};

export const parseTemplateFields = (template?: AiInspectionWorkOrderTemplate): WorkOrderFieldOption[] => {
  if (!template) {
    return [];
  }
  if (template.formFieldList?.length) {
    return template.formFieldList.map(toWorkOrderFieldOption).filter(Boolean);
  }
  if (!template.formJson) {
    return [];
  }
  try {
    const parsed = JSON.parse(template.formJson) as unknown;
    const fields = collectFormFields(parsed);
    return fields.map(toWorkOrderFieldOption).filter(Boolean);
  } catch {
    return [];
  }
};

export const buildWorkOrderFields = ({ fields, rule }: BuildWorkOrderFieldsOptions) => {
  const fieldMap = new Map(fields.map((item) => [item.fieldKey, item]));
  const mappings = [
    { fieldKey: rule.hiddenDangerObjectFieldKey, fieldValue: "${deviceId}", fallbackName: "隐患对象", fallbackType: "object" },
    { fieldKey: rule.sitePhotoFieldKey, fieldValue: "${fileId}", fallbackName: "现场照片", fallbackType: "file" },
    { fieldKey: rule.titleFieldKey, fieldValue: "${deviceName}AI巡检异常", fallbackName: "标题", fallbackType: "input" },
    { fieldKey: rule.descriptionFieldKey, fieldValue: "${aiSummary}", fallbackName: "描述", fallbackType: "textarea" },
  ];

  return mappings
    .filter((item): item is typeof item & { fieldKey: string } => Boolean(item.fieldKey))
    .map((item, index) => {
      const field = fieldMap.get(item.fieldKey);
      return {
        fieldKey: item.fieldKey,
        fieldName: field?.fieldName ?? item.fallbackName,
        fieldValue: item.fieldValue,
        fieldType: field?.fieldType ?? item.fallbackType,
        sort: index + 1,
      };
    });
};

export const mergePlanCameras = (plan: CameraAiInspectionPlan, options: AiInspectionSelectedCamera[]): AiInspectionSelectedCamera[] => {
  const optionMap = new Map(options.map((item) => [item.id, item]));
  return (plan.cameras ?? []).map((camera) => {
    const option = optionMap.get(String(camera.deviceId));
    return {
      id: String(camera.deviceId),
      name: option?.name ?? `设备已不可用（${camera.deviceId}）`,
      code: option?.code ?? "",
      areaId: option?.areaId,
      areaName: option?.areaName ?? "",
      onlineStatus: option?.onlineStatus,
      algorithmId: String(camera.algorithmId),
      unavailable: !option,
    };
  });
};

export const buildPlanPayload = (
  form: AiInspectionPlanFormState,
  cameras: AiInspectionSelectedCamera[],
  actionRulesByDeviceId: ReadonlyMap<string, AiInspectionActionRuleForm>,
): CameraAiInspectionPlanModifyParam => {
  const actionRules: CameraAiInspectionActionRuleParam[] = [];
  for (const camera of cameras) {
    const rule = actionRulesByDeviceId.get(camera.id);
    if (!rule?.enabled || !rule.actionType) {
      continue;
    }
    actionRules.push({
      deviceId: camera.id,
      enabled: true,
      actionType: rule.actionType,
      confidenceThreshold: rule.confidenceThresholdPercent / 100,
      emergencyRuleId: rule.actionType === CameraAiInspectionActionType.ALARM ? rule.emergencyRuleId : undefined,
    });
  }

  return {
    name: form.name.trim(),
    principalUserId: form.principalUserId ?? "",
    executionMode: form.executionMode,
    cycleType: form.executionMode === CameraAiInspectionExecutionMode.CYCLE ? form.cycleType : undefined,
    cycleValues: form.executionMode === CameraAiInspectionExecutionMode.CYCLE ? form.cycleValues.join(",") : undefined,
    executeTime: form.executionMode === CameraAiInspectionExecutionMode.CYCLE ? form.executeTime : undefined,
    startTime: form.startTime,
    endTime: form.endTime,
    enabled: form.enabled,
    immediateExecute: form.immediateExecute,
    taskLimitMinutes: form.taskLimitMinutes,
    remark: form.remark,
    cameras: cameras.map((camera, index) => ({
      deviceId: camera.id,
      algorithmId: camera.algorithmId ?? "",
      sort: index + 1,
    })),
    actionRules,
  };
};

const toWorkOrderFieldOption = (field: AiInspectionWorkOrderTemplateField): WorkOrderFieldOption => ({
  fieldKey: field.key ?? field.code ?? field.id ?? field.name,
  fieldName: field.name,
  fieldType: field.type ?? field.fromType,
  required: field.required,
});

const collectFormFields = (value: unknown): AiInspectionWorkOrderTemplateField[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectFormFields(item));
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  const children = ["children", "columns", "items", "list"].flatMap((key) => collectFormFields(record[key]));
  if (
    typeof record.name === "string" &&
    (typeof record.key === "string" || typeof record.code === "string" || typeof record.id === "string")
  ) {
    return [record as unknown as AiInspectionWorkOrderTemplateField, ...children];
  }
  return children;
};
