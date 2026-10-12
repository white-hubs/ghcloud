import type { DispatchItemVO, DispatchOrderVO } from "@ghcloud/cube-service-interface/emergency-supplies";

export const firstItem = (record?: DispatchOrderVO): DispatchItemVO | undefined => record?.items?.[0];

export const remainQuantity = (item?: DispatchItemVO): number => {
  if (!item) return 0;
  return Math.max(Number(item.outboundQuantity ?? 0) - Number(item.totalReturned ?? 0) - Number(item.totalWriteoff ?? 0), 0);
};

export const dispatchStatusClassNames = (styles: Record<string, string>, status?: string): string[] => [
  styles.statusTag,
  status === "PENDING"
    ? styles.statusWarn
    : status === "CANCELLED" || status === "WRITTEN_OFF"
      ? styles.statusDanger
      : styles.statusDefault,
];

export type ActionType = "outbound" | "return" | "writeoff";

export const actionTitle = (type: ActionType): string => {
  if (type === "outbound") return "确认出库";
  if (type === "return") return "归还登记";
  return "核销登记";
};

export { formatDateTime, formatDateTimeLocal } from "@/utils/format-datetime";
