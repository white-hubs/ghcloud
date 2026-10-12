import { getApiBaseUrL, getAuthHeaders } from "@ghcloud/cube-app-js-sdk";

import { HTTPClientImpl } from "../../infrastructure/http-client";

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

class AlarmRecordService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL() ?? "/api",
    headers: getAuthHeaders(),
  });

  public async getCommonPage(params: {
    pageNumber: number;
    pageSize: number;
    deviceIds: string;
    period?: string;
  }): Promise<AlarmRecordPage> {
    return await this.client.get<AlarmRecordPage>("/alarm/alarm-records/common-page", { query: params });
  }
}

export const alarmRecordService = new AlarmRecordService();
