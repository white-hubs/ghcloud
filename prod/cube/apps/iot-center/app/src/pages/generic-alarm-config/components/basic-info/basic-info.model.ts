import type { DeviceTypeAlarm } from "../alarm-device/alarm-device-model";
import type { RuleGroupType, RuleLineType } from "../alarm-rule/alarm-rule-model";
import type { AlarmLevels } from "@ghcloud/cube-service/src/alarm/alarm.model";
import type { EmergencyType } from "@ghcloud/cube-service/src/emergency/emergency.model";

export enum EmergencyActionBeforeType {
  // 报警研判前置判定
  ALARM_JUDGMENT = "ALARM_JUDGMENT",
}
export interface EmergencyActionBefore {
  actionBeforeType: EmergencyActionBeforeType;
  enabled: boolean;
  actionBeforeConfig: {
    // 是否系统处理
    systemProcess: boolean;
    // 研判时限（秒），仅当 enabled=true 时生效
    judgmentTimeoutSeconds: number;
  };
}

export type AllInfo = BasicData & {
  id: string;
  emergencyRuleConditionGroups: RuleGroupType[] | RuleLineType;
  lossAlarmCondition?: RuleLineType;
} & {
  emergencyRuleConditionDevices: DeviceTypeAlarm[];
} & { appointDevice: boolean } & {
  emergencyActions: {
    actionConfig: {
      dutyUser: boolean;
      targetModifyParams: {
        messageTargetNotify: string;
        targetConfig: {
          departmentId: string;
          departmentName: string;
          roleId: string;
          roleName: string;
          userId: string;
          userName: string;
        }[];
      }[];
    };
    actionType: string;
    enabled: true;
    id: string;
  }[];
} & { emergencyActionBeforeList: EmergencyActionBefore[] };
export interface BasicData {
  alarmLevelName: string | undefined;
  emergencyEventTypeName: string | undefined;
  emergencyEventTypeId?: string | undefined;
  name: string;
  alarmLevelId: string | undefined;
  emergencyEventTypeCode: string | undefined;
  repeatTime: number;
  estimatedHandlerTime: number;
  notifyCommandDispatch: boolean;
  remark: string;
  estimatedHandlerTimeName: string;
  estimatedHandlerUnit: string;
  applicationCode: string | undefined;
  turnWarningSound: boolean;
}
export interface BasicInfoData {
  alarmLevelData: AlarmLevels[];
  emergencyTypes: EmergencyType[];
}
export interface BasicInfoRef {
  save: () => Promise<BasicData>;
  exportData: () => BasicData;
}
