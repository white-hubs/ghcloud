import { getAuthRequester } from "../request";
import type { AlarmLevels } from "./alarm.model";

export interface AlarmRuleListQuery {
  pageNumber: number;
  pageSize: number;
  applicationCode?: string;
  keyword?: string;
  alarmLevelId?: string;
}

export interface AlarmRuleListItem {
  id: string;
  name?: string;
  alarmLevelName?: string;
  repeatTime?: number;
  repeatTimeUnit?: string;
  estimatedHandlerTime?: number | null;
  estimatedHandlerUnit?: string;
  enabled?: boolean;
  disableDuration?: number | null;
  remark?: string;
}

export interface AlarmRuleListResult {
  total: number;
  records: AlarmRuleListItem[];
}

export class AlarmService {
  private static readonly authRequester = getAuthRequester();

  public static async getAlarmLevels(): Promise<AlarmLevels[]> {
    const url = "/api/alarm/sat-alarm-levels";
    return this.authRequester.get({
      url,
    });
  }

  public static async getAlarmRuleList(query: AlarmRuleListQuery): Promise<AlarmRuleListResult> {
    const url = "/api/emergency/emergency-rule/list-page";
    return this.authRequester.get({
      url,
      payload: query as unknown as Record<string, unknown>,
    });
  }

  public static async getAlarmLineRuleList(query: AlarmRuleListQuery): Promise<AlarmRuleListResult> {
    const url = "/api/securitymanagement/lineLoss/alarm/rule/pageList";
    return this.authRequester.get({
      url,
      payload: query as unknown as Record<string, unknown>,
    });
  }

  public static async addAlarmRule(data: any): Promise<unknown> {
    const url = "/api/emergency/emergency-rule";
    return this.authRequester.create({
      url,
      payload: {
        ...data,
      },
    });
  }
  public static async addAlarmLineRule(data: any): Promise<unknown> {
    const url = "/api/securitymanagement/lineLoss/alarm/rule/add";
    return this.authRequester.create({
      url,
      payload: {
        ...data,
      },
    });
  }

  public static async getAlarmLineRule(emergencyRuleId: string): Promise<{ data: any }> {
    const url = `/api/securitymanagement/lineLoss/alarm/rule/detail?id=${emergencyRuleId}`;
    return this.authRequester.get({
      url,
    });
  }
  public static async putAlarmRule(data: any): Promise<{ data: unknown }> {
    const url = "/api/emergency/emergency-rule";
    return this.authRequester.update({
      url,
      payload: {
        ...data,
      },
    });
  }
  public static async putAlarmLineRule(data: any): Promise<{ data: unknown }> {
    const url = "/api/securitymanagement/lineLoss/alarm/rule/edit";
    return this.authRequester.create({
      url,
      payload: {
        ...data,
      },
    });
  }
  public static async enableAlarmRule(data: { id: string; enabled: boolean; disableDuration?: number | null }): Promise<unknown> {
    const url = "/api/emergency/emergency-rule/enabled";
    return this.authRequester.update({
      url,
      payload: data,
    });
  }

  public static async enableAlarmLineRule(data: { id: string; enabled: boolean }): Promise<unknown> {
    const url = "/api/securitymanagement/lineLoss/alarm/rule/enableRule";
    return this.authRequester.create({
      url,
      payload: data,
    });
  }

  public static async deleteAlarmRule(id: string): Promise<void> {
    const url = `/api/emergency/emergency-rule/delete/${id}`;
    await this.authRequester.custom({
      url,
      method: "DELETE",
    });
  }

  public static async deleteAlarmLineRule(id: string): Promise<void> {
    const url = "/api/securitymanagement/lineLoss/alarm/rule/delete";
    return this.authRequester.delete({
      url,
      payload: {
        id,
      },
    });
  }

  public static async getAlarmRule(emergencyRuleId: string): Promise<{ data: any }> {
    const url = `/api/emergency/emergency-rule/${emergencyRuleId}`;
    return this.authRequester.get({
      url,
    });
  }
}
