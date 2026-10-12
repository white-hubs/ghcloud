export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}

export interface UploadRes {
  accessPrefix: string;
  businessKey: null | string;
  id: string;
  name: string;
  path: string;
  refCount: 0;
  size: 687;
  suffix: string;
  tag: string;
  type: string;
}
export interface ImportType {
  fail: number;
  errorMsg: string[];
  success: number;
}
export interface ImportProductType {
  deviceSuccess?: string;
  deviceFailDetails?: string[];
  productSuccess: string;
  productFailDetails: string[];
  timestamp: number;
}
export interface RuleConditionExpsType {
  /**
   * 属性编码
   */
  id?: string | undefined;
  key?: string | undefined;
  propCode?: string | undefined;
  propName?: string | undefined;
  propUnit?: string | undefined;
  /**
   * 运算符
   */
  op?: null | undefined;
  /**
   * 值
   */
  oprand?: string | undefined;
  /**
   * 延迟时间
   */
  delayTime?: number | undefined;
  emergencyRuleConditionId?: string | undefined;
  emergencyRuleId?: string | undefined;
  startDelayTime?: number | null | undefined;
  endDelayTime?: number | null | undefined;

}

export interface EnumList { 
  label: string; 
  value: string | number | boolean;
}

export interface DefaultValueProperty {
  dataType?: string; 
  precision?: number; 
  enumList?: EnumList[];
  min?: number,
  max?: number,
  boolStart?: string,
  boolEnd?: string,
}