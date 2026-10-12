import * as emergencySuppliesClient from "@ghcloud/cube-services-client/emergency-supplies.client";

export const service = emergencySuppliesClient;

export const statusText: Record<string, string> = {
  ENABLED: "启用",
  DISABLED: "停用",
  SCRAPPED: "报废",
  PENDING: "待确认",
  OUTBOUND: "已出库",
  USING: "使用中",
  PARTIAL_RETURNED: "部分归还",
  RETURNED: "已归还",
  WRITTEN_OFF: "已核销",
  CANCELLED: "已取消",
};
export const statusLabel = (value?: string): string => (value ? (statusText[value] ?? value) : "--");
