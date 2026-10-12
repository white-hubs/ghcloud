import { CubeAlarmCenterService, CubeLinkageService, type MediaState } from "@ghcloud/cube-alarm-center-service";

import { authStore } from "@/api/auth-store";

const service = new CubeAlarmCenterService(authStore);
const linkageService = new CubeLinkageService(authStore);

export interface WarehouseAlarmRecord {
  id: string;
  alarmEvent?: string;
  alarmEventName?: string;
  alarmLevelCode?: string;
  alarmLevelName?: string;
  alarmStatus?: string;
  alarmStatusName?: string;
  alarmTargetCode?: string;
  alarmTargetKey?: string | number;
  alarmTargetName?: string;
  alarmTime?: string;
  alarmTypeName?: string;
  areaName?: string;
  businessKey?: string | number;
  code?: string;
  remark?: string;
}

export interface WarehouseAlarmDevice {
  id: string;
  code?: string;
  name?: string;
  area?: { pathName?: string };
  productInfo?: {
    name?: string;
    productCategory?: { name?: string; code?: string };
  };
  status?: { onlineState?: boolean };
}

export interface PageAlarmRecordsParams {
  keyword?: string;
  period?: { begin: string; end: string };
  pageSize?: number;
}

export async function pageWarehouseAlarmRecords(
  params: PageAlarmRecordsParams,
): Promise<{ records: WarehouseAlarmRecord[]; total: number }> {
  const result = await service.getAlarmRecordsPage({
    applicationCode: __ENV__.applicationCode,
    pageNumber: 1,
    pageSize: params.pageSize ?? 5,
    keyword: params.keyword,
    period: params.period,
  });
  return {
    records: (result.records ?? []) as WarehouseAlarmRecord[],
    total: result.total ?? 0,
  };
}

export async function listWarehouseAlarmDevices(alarmRecordId: string): Promise<WarehouseAlarmDevice[]> {
  const result = await service.getAlarmRecordDeviceList({
    alarmRecordId,
    pageNumber: 1,
    pageSize: 5,
  });
  return (result.records ?? []) as WarehouseAlarmDevice[];
}

export async function listWarehouseAlarmVideoFiles(businessKey: string): Promise<MediaState[]> {
  return linkageService.getEventVideoImages({ eventId: businessKey });
}

export type WarehouseAlarmMedia = MediaState;
