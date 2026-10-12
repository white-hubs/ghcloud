/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export type BusinessType = "STALL_TYPE" | "STALL" | "DEVICE_PROD_CATEGORY_CODE" | "DEVICE";
export interface DeviceProductPropVoList {
  productEventVoList: {
    eventName: string;
    eventCode: string;
  }[];
  productPropVoList: {
    propCode: string;
    propName: string;
    dataWrite: number;
  }[];
}
export interface TagType {
  id: string;
  tagName: string;
  tagCode: string;
  description: string;
  updateTime: string;
  enableStatus: boolean;
  whetherBindDevice: string;
}

export interface ProductCategoryTree {
  associatedItem: unknown;
  dictId: string;
  id: string;
  itemLabel: string;
  itemLevel: string;
  itemParentId: number;
  itemSort: number;
  itemValue: string;
  logicId: string;
  remark: string;
  status: number;
  name?: string;
  children: ProductCategoryTree[];
}
export interface ProductCategory {
  name: string;
  code: string;
}
export interface NorthDeviceProp {
  key?: string;
  ts?: number;
  val?: string;
}

export interface ProductModel {
  id: string;
  name: string;
  picture?: null | string;
  icon?: null | string;
  modelName: string;
  brandName: string;
  productCategory: ProductCategory;
}

export interface ProductIotCategoryTree {
  categoryName: string;
  categoryCode: string;
  categoryCodeConcat: string;
  children?: [];
}

export interface DeviceInstancePageParams {
  pageSize: number;
  pageNumber: number;
  departmentId?: string | undefined;
  keyword?: string | undefined;
  lastAreaId?: string | undefined;
  prodCategoryId?: string | undefined;
  bizType?: string | undefined;
}
export interface DeviceInstancePageParamsAll {
  pageSize: number;
  pageNumber: number;
  departmentId?: string | undefined;
  keyword?: string | undefined;
  lastAreaId?: string | undefined;
  categoryCode: string;
  filterIds?: string[];
  filterTagCodes?: string[];
  applicationCode?: string;
  productId: string;
  tagCodes?: string[] | undefined;
  total: number;
}
export interface ProductState {
  id: string | undefined;
  prodName: string | undefined;
}
export interface DeviceSceneConfig {
  businessId: string;
  businessType: string;
  id: string;
  sceneType: string;
  sceneTypeSequence?: string;
}
/** 通用字典 */
export interface UniversalDictionary {
  id: string;
  dictId: string;
  itemLabel: string;
  itemKey?: string;
  itemLevel: string;
  itemValue: string;
}

/**
 * 产品
 */
export interface Product {
  accessTypeId: number;
  /**
   * 回显时提供
   */
  accessTypeName?: string;
  /**
   * 回显时提供
   */
  createTimeFormat?: string;
  extendConfig?: string;
  id: number;
  /**
   * 是否自定义
   */
  isCustom?: number;
  /**
   * 1直连设备 2网关设备 3网关子设备
   */
  nodeType: number;
  /**
   * 回显时提供
   */
  nodeTypeName?: string;
  prodBrandId: string;
  /**
   * 回显时提供
   */
  prodBrandName?: string;
  prodCategoryId: number;
  prodCategoryItem: ProductCategoryTree[];
  /**
   * 回显时提供
   */
  prodCategoryName?: string;
  /**
   * 回显时提供
   */
  prodCategoryNameWithCascade?: string;
  /**
   * 产品图标
   */
  prodIcon?: number | null;
  prodIconFile?: { id: string; path: string };
  /**
   * 产品型号
   */
  prodModel: string;
  prodName: string;
  prodNumber?: string;
  /**
   * 产品图片
   */
  prodPic?: number;
  prodPicFile?: { id: string; path: string };
  protocolId: number;
  /**
   * 回显时提供
   */
  protocolName?: string;
  remark: string;
  /**
   * 1启用 0禁用
   */
  status: number;
  /**
   * 回显时提供
   */
  statusName?: string;
  /**
   * 回显时提供
   */
  updateTimeFormat?: string;
  deviceCount: number;
}

/** 设备标签占比 */
export interface DeviceTagPercentage {
  percentage: number;
  tagCode: string;
  tagDeviceNumber: number;
  tagName: string;
}

/** 设备状态数量统计 */
export interface DeviceTagStatusCount {
  alarmNumber: number;
  normalNumber: number;
  offlineNumber: number;
  totalNumber: number;
  troubleNumber: number;
}

export interface DeviceInstancePage {
  /**
   * 区域
   */
  area?: {
    id: string;
    /**
     * 单个区域名称
     */
    name: string;
    /**
     * 全路径id
     */
    pathId: string;
    /**
     * 全路径区域名称
     */
    pathName: string;
  };
  /**
   * 设备编码
   */
  code?: string;
  /**
   * 部门
   */
  department?: { id: string; name: string };
  /**
   * 设备id
   */
  id?: string;
  /**
   * 经纬度
   */
  lntAndLat: string;
  /**
   * 设备名称
   */
  name?: string;
  /**
   * 图片id
   */
  picture?: number;
  /**
   * 产品信息
   */
  productInfo?: {
    /**
     * 品牌名称
     */
    brandName: string;
    /**
     * 产品图标
     */
    icon: string;
    /**
     * 产品id
     */
    id: string;
    /**
     * 型号名称
     */
    modelName: string;
    /**
     * 产品名称
     */
    name: string;
    /**
     * 产品图片
     */
    picture: null;
    /**
     * 品类信息
     */
    productCategory: {
      code: string;
      name: string;
      /**
       * 全路径code
       */
      pathCode: string;
    };
  };
  status?: {
    /**
     * 最后通信时间
     */
    communicationTime: string;
    /**
     * true：在线 false：离线
     */
    onlineState: boolean;
  };
  /**
   * 第三方id
   */
  thirdPartyId: string;
}

export interface NorthProdListDetail {
  prodId: string;
  prodNumber: string;
  prodName: string;
  prodCategoryCode: string;
  prodCategoryName: string;
  prodBrandCode: string;
  prodBrandName: string;
  prodNumberCode: string;
  prodNumberName: string;
  remark: string;
  productPropVoList: {
    propCode: string;
    propName: string;
    dataType: string;
    precision: number;
    unitName: string;
    dataWrite: number;
    dataConstraint: { label: string; value: string | number | boolean }[];
    isTelemetry: unknown;
    remark: string;
  }[];
  productEventVoList: {
    eventName: string;
    eventCode: string;
    eventConfig: {
      triggerType: string;
      eventRelatedProp: string;
      rules: {
        op: string;
        delayTime: number;
        propCode: string;
        oprand: number[];
      };
    };
    categoryCode: string;
    categoryName: string;
    remark: string;
  };
}

export interface NorthDeviceDetail {
  /**
   * 设备id
   */
  deviceId?: number;
  /**
   * 设备名称
   */
  deviceName?: string;
  /**
   * 物联网设备编码,注意此编码不等同于孪生设备编码，但可作为默认的孪生设备编码
   */
  deviceNumber: string;
  /**
   * 父设备id
   */
  deviceParentId?: number;
  /**
   * 通信状态
   */
  onlineState: number;
  productCommandVoList: Record<string, unknown>[];
  productEventVoList: ProductEventVoList[];
  productId?: number;
  /**
   * 产品名称
   */
  productName: string;
  productPropVoList: ProductPropVoList[];
  snapshots: Snapshot[];
  /**
   * 未来支持的设备标签
   */
  tags?: string;
}

export interface ProductEventVoList {
  /**
   * 事件分类(前期使用id实现,后期可能会用code实现)
   */
  categoryCode?: string;
  /**
   * 事件分类名称
   */
  categoryName?: string;
  /**
   * 事件编码
   */
  eventCode?: string;
  /**
   * 事件配置
   */
  eventConfig?: EventConfig;
  /**
   * 事件名称
   */
  eventName?: string;
  /**
   * 备注
   */
  remark?: string;
}

/**
 * 事件配置
 */
export interface EventConfig {
  eventRelatedProp?: string[];
  /**
   * 规则
   */
  rules?: Record<string, unknown>;
  /**
   * 触发类型
   */
  triggerType?: TriggerType;
}

/**
 * 触发类型
 */
export enum TriggerType {
  Empty = "",
  Nature = "NATURE",
  Setting = "SETTING",
  Simple = "SIMPLE",
}

export interface ProductPropVoList {
  /**
   * 数据约束定义
   * 属性约束[{"value":"1","label":"在线"},{"value":"0","label":"关屏"},{"value":"-1","label":"离线"}]
   * or [0.0,999.0]
   */
  dataConstraint?: (string | { label: string; value: string | number })[];
  /**
   * 数据类型
   */
  dataType?: DataType;
  /**
   * 数据写入,0读 1读写
   */
  dataWrite?: number;
  /**
   * 遥测属性标识,预留坑位吧
   */
  isTelemetry?: boolean;
  /**
   * 属性名称
   */
  name?: string;
  /**
   * 精度,浮点数由此选项(貌似放入约束中好一点)
   */
  precision?: number;
  /**
   * 属性编码
   */
  propCode?: string;
  propName?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 单位名称
   */
  unitName?: string;
}

/**
 * 数据类型
 */
export enum DataType {
  Boolean = "boolean",
  Double = "double",
  Enum = "enum",
  Float = "float",
  Int = "int",
  Long = "long",
  String = "string",
}

export interface Snapshot {
  /**
   * 属性code
   */
  key: string;
  /**
   * 时间戳
   */
  ts: number;
  /**
   * 属性值
   */
  value: string;
}

export interface DeviceSamplingHistoryResult {
  propValues?: Record<string, PropValueKey>;
  ts?: number | null;
  deviceName?: string | null;
}

export interface PropValueKey {
  date?: null | string;
  propCode?: null | string;
  ts?: number | null;
  /**
   * 属性值
   */
  value?: Record<string, unknown>;
  /**
   * 属性值以String方式给出
   */
  valueOfStr?: null | string;
  /**
   * 翻译后的值
   */
  valueOfTranslate?: null | string;
  unit?: string;
}

export interface CustomerTag {
  /**
   * 描述
   */
  description?: null | string;
  id?: string;
  /**
   * 标签名称
   */
  tagName?: null | string;
}
export interface BuiltinsTag {
  /**
   * 标签主键
   */
  id: string;
  /**
   * 标签code
   */
  tagCode: string;
  /**
   * 标签名称
   */
  tagName: string;
}
export interface FileVO {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey?: string;
  endpointPath: string;
  createTime: number;
}
interface SubProductVo {
  productIds: string;
  productNames: string;
}
export interface BuildingDataVo {
  id: string;
  name: string;
  type: string;
  typeName: string;
  format: string;
  size?: number;
  areaIds: string[];
  areaId: string;
  areas: unknown[];
  areasName: string;
  deptIds: string[];
  deptId: string;
  deptsName: string;
  createBy: string;
  updateTime: number;
  fileVO?: FileVO;
}
export interface DeviceDataTypeVo {
  id: string;
  modelType: string;
  typeName: string;
  oneLevelType: string;
}
export interface DeviceKnowledgeVo {
  id: string;
  name: string;
  deviceProdCategoryCode: string;
  deviceProdCategoryCodeConcat: string;
  deviceProdCategoryName: string;
  product: SubProductVo;
  format: string;
  size: string;
  userId: string;
  submitter: string;
  updateTime: string;
  fileVO: FileVO;
}
export interface CustomerTagVO {
  /**
   * 标签描述
   */
  description?: null | string;
  /**
   * 状态
   */
  enableStatus?: boolean | null;
  id?: string;
  /**
   * 标签code
   */
  tagCode?: null | string;
  /**
   * 标签名称
   */
  tagName?: null | string;
  /**
   * 编辑时间
   */
  updateTime?: null | string;
  /**
   * 是否绑定设备
   */
  whetherBindDevice?: boolean | null;
}
export interface DeviceTagDetail {
  /**
   * 标签描述
   */
  description?: null | string;
  /**
   * 状态
   */
  enableStatus?: boolean | null;
  id?: string;
  /**
   * 标签code
   */
  tagCode?: null | string;
  /**
   * 标签名称
   */
  tagName?: null | string;
  /**
   * 编辑时间
   */
  updateTime?: null | string;
  /**
   * 是否绑定设备
   */
  whetherBindDevice?: boolean | null;
}

export interface DeviceMgtSchemaTipsVO {
  devName: string;
  devNum: string;
  isRoot: boolean;
  parentDevName?: string;
  parentDevNum?: string;
  root: boolean;
  schema: string;
  tenantId: string;
}

/** 设备台账详情 */
export interface DeviceInstanceDetail {
  baseArchivesInfo: {
    area: { id: string; name: string; pathName: string; pathId: string } | null;
    code: string;
    department: { id: string; name: string } | null;
    id: string;
    manager: { id: string; name: string }[];
    name: string;
    picture: string;
    status: { onlineState: boolean; communicationTime: number | null };
    thirdPartyId: string;
    thirdpartyCfg: string;
  };
  expandInfo: {
    factoryInfo: { productionDate: null | number; usefulLife: number };
    id: string;
    lntAndLat: string;
    locationDes: string;
    purchaseInfo: { unitPrice: string; purchaseDate: number };
  };
  productInfo: {
    brandName: string;
    icon: string;
    id: string;
    modelName: string;
    name: string;
    picture: string;
    productCategory: { name: string; code: string; pathCode: string };
  };
  slaveDeviceList: {
    id: string;
    name: string;
  }[];
}
export interface HistoryGroup {
  key: string;
  value: number;
  preValue: number;
  changed: boolean;
  ts: number;
}
export interface NorthDeviceListDetailVO {
  changed?: boolean | null;
  key?: null | string;
  preValue?: Record<string, unknown>;
  ts?: number | null;
  value?: Record<string, unknown>;
}
export interface ProductPropVo {
  propCode: string;
  propName: string;
  dataType: string;
  precision: number;
  unitName: string;
  dataWrite: number;
  dataConstraint: { label: string; value: string | number | boolean }[];
  isTelemetry: unknown;
  remark: string;
}

export interface DeviceCenterInternalDetailVO {
  id: string;
  name: string;
  status: number;
  statusName: string;
  deviceType: string;
  deviceTypeName: string;
  activationTime: number;
  activationTimeStr: string;
  onlineTime: number;
  onlineTimeStr: string;
  config: string;
  rawDeviceId: string;
  deviceKey: string;
  deviceNumber: string;
  productId: string;
  productName: string;
  nodeType: string;
  slaveDeviceIds: string;
  mainDeviceId: string;
}

/** 设备关联条件scoped */
export enum EquipmentAssociationOperator {
  GreaterThan = "GREATER_THAN",
  GreaterThanOrEqual = "GREATER_THAN_OR_EQUAL",
  In = "IN",
  LessThan = "LESS_THAN",
  LessThanOrEqual = "LESS_THAN_OR_EQUAL",
  Like = "LIKE",
  NotIn = "NOT_IN",
}

export enum EquipmentAssociationFiled {
  Area = "AREA",
  Product = "PRODUCT",
  Equipment = "DEVICE",
}

export interface EquipmentAssociationRuleField {
  /**
   * 字段名
   */
  field: EquipmentAssociationFiled;
  /**
   * 字段条件
   */
  operator: EquipmentAssociationOperator;
  /**
   * 字段值
   */
  value: string[];
}
export interface MaintainStatistics {
  /**
   * 设备编号
   */
  deviceCode: string;
  /**
   * 设备名称
   */
  deviceName: string;
  /**
   * 故障单统计
   */
  fault?: Fault;
  /**
   * 隐患单统计
   */
  hiddenDanger?: HiddenDanger;
  /**
   * 设备id
   */
  id: string;
  /**
   * 巡检统计
   */
  inspect?: Inspect;
  /**
   * 产品品类
   */
  productCategoryName: string;
  /**
   * 所属产品
   */
  productName: string;
  /**
   * 维保统计
   */
  upkeep?: Upkeep;
  area?: Area;
}

/**
 * 故障单统计
 */
export interface Fault {
  /**
   * 已处理数
   */
  handlerNum: number;
  /**
   * 处理率
   */
  handlerRatio: number;
  /**
   * 总数
   */
  num: number;
  /**
   * 未处理数
   */
  unHandlerNum: number;
}

/**
 * 隐患单统计
 */
export interface HiddenDanger {
  /**
   * 已处理数
   */
  handlerNum: number;
  /**
   * 处理率
   */
  handlerRatio: number;
  /**
   * 总数
   */
  num: number;
  /**
   * 未处理数
   */
  unHandlerNum: number;
}

/**
 * 巡检统计
 */
export interface Inspect {
  /**
   * 异常数量
   */
  abnormalNum: number;
  /**
   * 异常率
   */
  abnormalRatio: number;
  /**
   * 工单数量
   */
  num: number;
  /**
   * 任务数量
   */
  taskNum: number;
}

/**
 * 维保统计
 */
export interface Upkeep {
  /**
   * 最近时间
   */
  lastTime: string;
  /**
   * 数量
   */
  num: number;
}
export interface DeviceGroupPage {
  id: string;
  name: string;
  remark: string;
}

export interface Statu {
  onlineState: boolean;
  communicationTime?: string;
}

export interface Area {
  id: string;
  name: string;
  pathName: string;
  pathId: string;
}

export interface ProductCategory {
  name: string;
  code: string;
  pathCode: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  picture?: string;
  icon?: string;
  modelName: string;
  brandName: string;
  productCategory: ProductCategory;
}

export interface DeviceGroupDevices {
  id: string;
  name: string;
  code: string;
  status: Statu;
  department?: string;
  thirdPartyId: string;
  lntAndLat: string;
  locationDes: string;
  area: Area;
  picture?: string;
  productInfo: ProductInfo;
}

/**
 * 设备排序条件，设备排序条件(目前单个,后续可能多个字段排序)
 */
export interface DeviceSort {
  /**
   * 排序方式
   */
  sort: Sort;
  /**
   * 排序字段
   */
  sortField: SortField;
}

/**
 * 排序方式
 */
export enum Sort {
  Asc = "ASC",
  Desc = "DESC",
}

/**
 * 排序字段
 */
export enum SortField {
  OnlineStatus = "ONLINE_STATUS",
}
export interface DeviceGroup {
  /**
   * 设备数量
   */
  deviceCount?: number;
  devices: Device[];
  /**
   * 分组主键
   */
  id: string;
  /**
   * 分组名
   */
  name: string;
  /**
   * 描叙
   */
  remark?: string;
}

export interface Device {
  /**
   * 设备编码
   */
  code: string;
  /**
   * 设备主键
   */
  id: string;
  /**
   * 设备名称
   */
  name: string;
  /**
   * 设备第三方设备id
   */
  thirdPartyId?: string;
}
/**
 * 产品-属性
 */
export interface ProductProp {
  createTimeFormat?: string;
  /**
   * 数据规则,JSON数组，[{"value":"0","label":"关"},{"value":"1","label":"开"}] or [1, 9] or []
   */
  dataConfig?: string;
  dataType?: string;
  /**
   * 回显时提供
   */
  dataTypeName?: string;
  /**
   * 0只读:1读写
   */
  dataWrite?: number;
  /**
   * 更新需要
   */
  id?: number | null;
  name?: string;
  precision?: number;
  prodId?: number;
  propCode?: string;
  remark?: string;
  unitId?: number;
  /**
   * 回显时提供
   */
  unitName?: string;
  dataConstraint?: { label: string; value: string | number | boolean }[];
}
export interface CompareType {
  itemLabel: string;
  itemValue: string;
}

export interface DeviceDataShare {
  id: string;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceProductId: string;
  sourceProductName: string;
  sourceDataType: number;
  sourceDataId: string;
  sourceDataCode: string;
  targetDeviceId: string;
  targetProductId: string;
  targetProductName: string;
  targetDataId: string;
  shareMode: number;
}

export interface ProductCategoryModel {
  id: string;
  dictId: string;
  itemCode: string;
  itemParentId: string;
  itemLevel: number;
  itemLabel: string;
  itemValue: string;
  itemSort: number;
  status: number;
  remark: string;
  createTime: string;
  updateTime: string;
  level: number;
  children: ProductCategoryModel[];
}
export interface ProductBrandModel {
  id: string;
  dictId: string;
  itemCode: string;
  itemParentId: string;
  itemLevel: number;
  itemLabel: string;
  itemValue: string;
  itemSort: number;
  status: number;
  remark: string;
  createTime: string;
  updateTime: string;
  fileVOs: FileVO[];
}
export interface ProductDetailModel {
  id: string;
  prodNumber: string;
  prodName: string;
  prodNamePinyin: string;
  prodCategoryId: string;
  prodCategoryName: string;
  prodCategoryNameChain: string;
  nodeType: number;
  prodBrandId: string;
  prodBrandName: string;
  protocolId: string;
  protocolName: string;
  prodModel: string;
  remark: string;
  status: number;
  iconFileVO: FileVO;
  picFileVO: FileVO;
}
export interface ProductMethodDetailModel {
  id: string;
  prodId: string;
  name: string;
  methodCode: string;
  callType: string;
  timeoutSeconds: number;
  retryCount: number;
  retryInterval: number;
  remark: string;
  status: number;
  inputParams: {
    params: ProductMethodParamModel[];
  };
  outputParams: {
    params: ProductMethodParamModel[];
  };
}

export interface ProductMethodParamModel {
  name: string;
  param_code: string;
  data_type: string;
  description: string;
  required: boolean;
  precision: number;
  unit_symbol: string;
  data_config: ProductMethodParamDataConfigModel;
}

export interface ProductMethodParamDataConfigModel {
  type: string;
  enumValues: { value: string; label: string }[];
  len: number;
  min: number;
  max: number;
  step: number;
  pattern: string;
}

export interface ProductEventDetailModel {
  id: string;
  prodId: string;
  name: string;
  eventCode: string;
  config: string;
  categoryId: string;
  categoryName: string;
  remark: string;
  status: number;
  statusName: string;
  eventConfig: {
    triggerType: string;
    eventRelatedProp: string[];
    rules: {
      deviceId: string;
      propCode: string;
      op: string;
      oprand: string[];
      delayTime: string;
    };
    params: ProductMethodParamModel[];
  };
}
