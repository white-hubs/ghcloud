export interface RuleConditionExpCommand {
  delayTime: number | null;
  emergencyRuleConditionId?: string;
  emergencyRuleId?: string;
  endDelayTime?: number | null;
  id?: string ;
  op: string | null;
  oprand: string | null;
  propCode: string | null;
  propName: string | null;
  propUnit: string | null;
  startDelayTime?: number | null;
}
export interface RuleConditionCommand {
  conditionType: string | null;
  deviceEventCode: string | null;
  deviceEventName: string | null;
  deviceEventType: string | null;
  deviceGenreId: string | null;
  deviceGenreName: string | null;
  deviceModelId: string | null;
  deviceModelName: string | null;
  emergencyRuleConditionExpCommands: RuleConditionExpCommand[];
}
export interface RuleConditionDeviceCommand {
  deviceAreaId: string;
  deviceAreaName: string;
  deviceGenreId: string;
  deviceGenreName: string;
  deviceId: string;
  deviceModelId: string;
  deviceModelName: string;
  deviceName: string;
  emergencyRuleId: string;
  id?: string;
}
export interface AlarmRuleConfigState {
  rulePeriodTimed: boolean;
  emergencyRuleTimeCommands: {
    startTime: string;
    endTime: string;
    id?: string;
  }[];
  emergencyRuleConditionCommands: RuleConditionCommand[];
  emergencyRuleConditionDeviceCommands: RuleConditionDeviceCommand[];
}
export interface AlarmActionConfigState {
  actionConfig: {
    dutyUser: boolean;
    targetModifyParams: {
      id?: string;
      messageTargetNotify: string;
      targetConfig: Record<string, string>;
    }[];
  };
  actionType: string;
  enabled: boolean;
  id?: string;
}
