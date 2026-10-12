import type { Paging } from "@ghcloud/cube-service-interface/base";

export enum DeviceConditionFieldEnum {
  PRODUCT = "PRODUCT",
  AREA = "AREA",
  DEVICE = "DEVICE",
}

export enum DeviceConditionOperatorEnum {
  GREATER_THAN = ">",
  GREATER_THAN_OR_EQUAL = ">=",
  LESS_THAN = "<",
  LESS_THAN_OR_EQUAL = "<=",
  IN = "in",
  NOT_IN = "not in",
  LIKE = "like",
  EQ = "eq",
}

export interface RuleField {
  field: DeviceConditionFieldEnum;
  operator: DeviceConditionOperatorEnum;
  value: string[];
}

export interface Rule {
  ruleFields: RuleField[];
}

export interface RuleGroup {
  rules: Rule[];
}

export interface ListDeviceInstanceOfRuleConditionParams extends Partial<Paging> {
  ruleGroup: RuleGroup;
}

export interface ListDeviceGroupParams extends Partial<Paging> {
  keyword?: string;
  tagCode: string;
}

export interface ListDeviceInstancesParams extends Partial<Paging> {
  keyword?: string;
  productId?: string;
  categoryCode?: string;
  tagCodes?: string[];
  filterTagCodes?: string[];
  filterAreaIds?: string[];
  // 左匹配，sequence
  anyMatchedAreaId?: string;
  // 模糊匹配 sequence
  anyAreaId?: string;
}

/** `GET /device/mgt/page` 查询参数。 */
export interface ListDeviceManagementPageParams extends Partial<Paging> {
  prodId?: string | number;
  status?: number;
  deviceNameOrNumber?: string;
  isMainDeviceOnly?: boolean;
  deviceIds?: string;
}

/** `GET /base/prod-brand/page` 产品品牌分页查询参数。 */
export interface ListProductBrandsParams extends Partial<Paging> {
  dictId?: string;
  itemLabel?: string;
}

export interface QueryDeviceInstancesParams {
  keywordLike?: string;
  productId?: string;
  categoryCode?: string;
  tagCodes?: string[];
  matchedDeviceIds?: string[];
  anyMatchedAreaId?: string;
  anyMatchedDepartmentId?: string;
  withDeviceExpandInfo?: boolean;
  withDeviceTagInfo?: boolean;
}

export interface QueryDeviceIdsByAreaOrGroupAndTagParams {
  tagCode: string;
  areaIds?: string[];
  groupIds?: string[];
  deviceIds?: string[];
}

/** 按标签分页查询设备实例（可视化关联列表） */
export interface ListVisualBoundDevicesParams {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  anyAreaId?: string;
  tagCodes: string[];
}

export interface BindVisualDevicesParams {
  sceneType: string;
  businessIds: string[];
  deviceBindWay: "ALL_EQUIPMENT" | "APPOINT_EQUIPMENT";
  keyword?: string;
  categoryCode?: string[];
  deviceProdCategoryCodeConcat?: string;
}

export interface UnbindVisualDevicesParams {
  sceneType: string;
  businessIds: string[];
}

/** 统计场景标签下区域为空的设备数量 */
export interface CountAreaEmptyDevicesParams {
  tagCodes: string[];
  keyword?: string;
}

export interface AreaEmptyDeviceTotal {
  totalNum: number;
}
