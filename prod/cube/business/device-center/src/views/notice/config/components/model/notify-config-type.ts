export interface NotifyConfigDetail {
  name?: string | undefined;
  prodName?: string | undefined;
  productCategoryName?: string | undefined;
  enabled: boolean | undefined;
  ruleConditions?: RuleCondition[] | undefined;
  messageNotifies?: MessageNotifyConfig[] | undefined;
}

export interface RuleCondition {
  conditionType?: string | undefined;
  deviceEventId?: string | undefined;
  deviceEventCode?: string | undefined;
  deviceEventName?: string | undefined;
  deviceEventType?: string | undefined;
  logicalOp?: string | undefined;
  ruleConditionExps?: RuleConditionExps[] | undefined;
}

export interface RuleConditionExps {
  propCode?: string | undefined;
  propName?: string | undefined;
  propUnit?: string | undefined;
  op?: string | undefined;
  oprand?: string | undefined;
  delayTime?: number | undefined;
  startDelayTime?: number | undefined;
  endDelayTime?: number | undefined;
}

export interface ProductPropType {
  propCode: string;
  name: string;
  propUnit: string;
  dataType: string;
  precision: string;
  unitName: string;
  dataWrite: string;
  remark: string;
}

export interface ProductEventType {
  eventName: string;
  eventCode: string;
  categoryCode: string;
  categoryName: string;
  remark: string;
  eventConfig: unknown;
}
export interface PropType {
  key: string;
  val: string;
  unitName: string;
  name?: string;
  value?: string;
  ts: string | number;
}
export interface ConfigType {
  label: string;
  value: string;
}
export interface DeviceDetailType {
  deviceId: string;
  deviceParentId: string;
  deviceNumber: string;
  productId: string;
  productName: string;
  tags: string;
  onlineState: number;
  dataConstraint: ConfigType[];
  productPropVoList: ProductPropType[];
  productEventVoList: ProductEventType[];
  snapshots: PropType[];
}

export interface MessageNotifyConfig {
  channelTypes?: string[];
  targets?: MessageTargetModifyParams[];
}

export interface MessageTargetModifyParams {
  departmentId?: string | string[] | undefined;
  messageTargetNotify?: string | undefined;
  role?: { id: string; name: string }[] | undefined;
  user?: { id: string; name: string }[] | undefined;
  targetConfig?: unknown[] | undefined;
}
