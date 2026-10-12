import type { ProductIotCategoryTree, ProductModel } from "@ghcloud/cube-iot-center-service";

export interface EmergencyRuleConditionExpsType {
  /**
   * 属性编码
   */
  id: string;
  propCode: string | undefined;
  propName: string;
  propUnit: string;
  /**
   * 运算符
   */
  op: null;
  /**
   * 值
   */
  oprand: string;
  /**
   * 延迟时间
   */
  delayTime: number;
  emergencyRuleConditionId: string;
  emergencyRuleId: string;
  startDelayTime: number | null;
  endDelayTime: number | null;
}
export interface RuleGroupType {
  id: string;
  emergencyRuleConditions: RuleDataType[];
  emergencyRuleTime: RuleTimeType;
}

export interface RuleTimeType {
  timeType: "ALL" | "WEEK" | "MONTH" | "TIME";
  timeConditions: string;
  timeList: {
    beginTime: string;
    endTime: string;
  }[];
}
export interface RuleDataType {
  id: string;

  deviceProdId: string | undefined;
  deviceProdCategoryCodeConcat: string;
  deviceEventName: string;
  deviceProdCategoryName: string;
  deviceEventType: string;
  deviceProdName: string;
  // /**
  //  * 设备品类id
  //  */
  // deviceGenreId: string;
  // deviceGenreName: string;
  // /**
  //  * 设备型号id
  //  */
  // deviceModelId: string;
  // deviceModelName: string;
  /**
   * 条件类型
   */
  conditionType: string | null;
  /**
   * 条件表达式
   */

  emergencyRuleConditionExps: EmergencyRuleConditionExpsType[];
  /**
   * 设备事件编码

   */
  deviceEventCode: string | undefined;
  /**
   * 设备事件-设定比较：阈值设定 | 参数设值
   */
  eventConfigType?: "THRESHOLD_SETTING" | "PARAMETER_SETTING";
}
export interface AlarmRulesDeviceType {
  deviceType: ProductIotCategoryTree[];
  deviceModel: ProductModel[];
  devicePropCode: {
    propName: string;
    propCode: string;
  }[];
  deviceEventCode: {
    eventName: string;
    eventCode: string;
    eventConfig: {
      triggerType: string;
      params?: Array<{ name: string; param_code: string }>;
    };
  }[];
  propCode: {
    label: string;
    value: string;
  }[];
  conditionType: "DEVICE_EVENT_CONDITION" | "CUSTOM_RULE_CONDITION";
}

export interface AlarmRuleRef {
  getValue: () => Promise<RuleGroupType[]>;
  addRuleGroup: () => void;
}
export interface AlarmLineRuleRef {
  getValue: () => Promise<RuleLineType>;
}
export interface RuleLineType {
  condition: string;
  lineIdList: Array<number | string>;
  connectionList?: {
    id: string;
    lineName: string;
    fromDevice?: { id?: string; name?: string };
    toDevice?: { id?: string; name?: string };
  }[];
}
