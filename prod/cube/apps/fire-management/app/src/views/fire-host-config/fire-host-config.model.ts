import type { FireHostRecord } from "@ghcloud/cube-service-interface/fire-management";

export type { FireDeviceSelectionRecord as DeviceSelectionRecord } from "@/components/fire-device-select-modal";

export interface FireHostStatistics {
  hostCount: number;
  pointCount: number;
  todayAlarmCount: number;
  todayFaultCount: number;
}

export interface HostSearchParams extends Record<string, unknown> {
  pageNumber: number;
  pageSize: number;
  total: number;
  keyword: string;
  brandName: string;
}

export interface HostFormModalExpose {
  openModal: () => void;
}

export interface ControlPasswordModalExpose {
  openModal: (record: FireHostRecord) => void;
}
