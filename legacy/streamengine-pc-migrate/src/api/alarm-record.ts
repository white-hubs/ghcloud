import { request } from "@/service";

export interface AlarmRecord {
  id?: string;
  businessKey?: string;
  alarmEvent?: string;
  alarmEventName?: string;
  alarmTypeName?: string;
  alarmTime?: string | number;
  createTime?: string | number;
  alarmTargetName?: string;
  deviceName?: string;
  alarmStatus?: string;
  alarmStatusName?: string;
}

export interface AlarmRecordPage {
  total: number;
  records: AlarmRecord[];
}

export const getAlarmRecordCommonPage = async (params: {
  pageNumber: number;
  pageSize: number;
  deviceIds: string;
  period?: string;
}): Promise<AlarmRecordPage> => {
  return await request.get<AlarmRecordPage>("/alarm/alarm-records/common-page", { params });
};
