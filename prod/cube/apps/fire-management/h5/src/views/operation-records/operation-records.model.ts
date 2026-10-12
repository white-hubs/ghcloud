export type OperationType = "controlButton" | "busPanel" | "multiLinePanel";
export type OperationResult = "processing" | "success" | "failed";

export interface FireOperationRecord {
  id: string;
  operationTime: string | number;
  hostId: string;
  hostName: string;
  operator: string;
  operationType: OperationType;
  content: string;
  result: OperationResult;
  failureReason?: string;
}

export interface OperationRecordFilters {
  operationType: OperationType | "";
  result: OperationResult | "";
  hostId: string;
  operator: string;
  startDate: string;
  endDate: string;
}

export const OPERATION_TYPE_LABEL: Record<OperationType, string> = {
  controlButton: "控制按钮",
  busPanel: "总线盘",
  multiLinePanel: "多线盘",
};

export const OPERATION_RESULT_LABEL: Record<OperationResult, string> = {
  processing: "处理中",
  success: "成功",
  failed: "失败",
};

export const DEFAULT_OPERATION_RECORD_FILTERS: OperationRecordFilters = {
  operationType: "",
  result: "",
  hostId: "",
  operator: "",
  startDate: "",
  endDate: "",
};

export const OPERATION_TYPE_OPTIONS = [
  { text: "全部操作", value: "" },
  { text: OPERATION_TYPE_LABEL.controlButton, value: "controlButton" },
  { text: OPERATION_TYPE_LABEL.busPanel, value: "busPanel" },
  { text: OPERATION_TYPE_LABEL.multiLinePanel, value: "multiLinePanel" },
];

export const OPERATION_RESULT_OPTIONS = [
  { text: "全部结果", value: "" },
  { text: OPERATION_RESULT_LABEL.processing, value: "processing" },
  { text: OPERATION_RESULT_LABEL.success, value: "success" },
  { text: OPERATION_RESULT_LABEL.failed, value: "failed" },
];
