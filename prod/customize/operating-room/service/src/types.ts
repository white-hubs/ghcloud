import { FileVOState } from '@ghcloud/cube-protocol'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'

/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export interface ErrorMsgList {
  key: string;
  value: string;
}

export interface ImportResult {
  fail: number;
  success: number;
  errorMsgList: ErrorMsgList[];
}
export interface DeptDeviceTreeVo {
  id: string;
  code: string;
  selectable: boolean;
  name: string;
  deviceBool: boolean;
  children: DeptDeviceTreeVo[];
  deviceList: unknown[];
}
export interface ResourceMachinesRecord {
  id: string;
  code: string;
  arguments: string;
  fileIds: string;
  roomIds: string;
  createTime: number;
  tenant: string;
  fileList: unknown[];
  roomNumber: number;
}

export interface FileList {
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
export interface ItemList {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  name: string;
  size: string;
  number: string;
  manufacturer: string;
  model: string;
  machinesId?: string;
  machinesCode: string;
  deptId: string;
  deptName: string;
  arguments: string;
  fileIds: string;
  fileList: FileList[];
}

export interface ItemDetailsVo {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  machinesId: string;
  machinesCode: string;
  deptId: string;
  deptName: string;
  arguments: string;
  fileIds: string;
  fileList: FileList[];
  itemList: ItemList[];
}
export interface RuleNormParam {
  /**
   * 字典编码
   */
  normCode: string;
  /**
   * 是否展示
   */
  display?: number;
  /**
   * 下限
   */
  lowerLimit?: number | null;
  /**
   * 指标名称
   */
  normName: string;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 上限
   */
  upperLimit?: number | null;
  /**
   * 展示区域
   */
  showArea?: string | number | undefined | null;
  /**
   * 展示排序
   */
  sort?: number | null;
  /**
   * 类型
   */
  dataType?: string;
}

/**
* RealTimeMonitorVO
*/
export interface RealTimeMonitorVO {
  areaId: string | undefined;
  details: NormDataVO[];
  id: string;
  deviceId?: string;
  /**
   * 手术室名称
   */
  operatingRoomName: string | undefined;
  /**
   * 手术室状态
   */
  status: DeviceStatus;
  deviceInfo: SecurityDeviceRecord | MedicalIotRealTimeDataVO | MedicalOverrunAlarmHistoryRecordVO;
  background: {
    url: string;
    type: string;
    // type: 'video' | 'image';
  };
  /**
   * 所属部门
   */
  depId?: number | string;
  depName?: string;
  deviceName?: string;
  /**
   * 指标状态
   */
  deviceStatus?: string;
  /**
   * 企业名称
   */
  tenantName?: string;
  areaOptions?: string;
}

export enum DeviceStatus {
  VALID = 'VALID', // 正常
  NORMAL = 'NORMAL', // 正常
  ABNORMAL = 'ABNORMAL', // 异常
  INVALID = 'INVALID', // 无效
}
export enum DevicePropStatus {
  NORMAL = 'NORMAL', // 正常
  LOWER_LIMIT = 'LOWER_LIMIT', // 低于下限
  UPPER_LIMIT = 'UPPER_LIMIT', // 超过上限
}

export const DeviceStatusOptions = [
  {
    label: '正常',
    value: 'NORMAL',
    color: '#52c41a',
    bgColor: 'rgba(106,181,57,0.1)'
  },
  {
    label: '异常',
    value: 'ABNORMAL',
    color: '#ff4d4f',
    bgColor: ' rgba(255,65,88,0.1)'
  },
  {
    label: '无效',
    value: 'INVALID',
    color: '#d9d9d9',
    bgColor: 'rgba(217,217,217,0.1)'
  }
]
export const DevicePropStatusOptions = [
  {
    label: '正常',
    value: 'NORMAL',
    color: '#52c41a'
  },
  {
    label: '低于下限',
    value: 'ABNORMAL',
    color: '#ff4d4f'
  },
  {
    label: '低于下限',
    value: 'LOWER_LIMIT',
    color: '#ff4d4f'
  },
  {
    label: '超过上限',
    value: 'UPPER_LIMIT',
    color: '#ff4d4f'
  },
  {
    label: '无效',
    value: 'INVALID',
    color: '#d9d9d9'
  }
]
/**
* 指标详情
*
* NormDataVO
*/
export type NormDataVO = RuleNormParam & {
  value: number | undefined;
  status: DevicePropStatus;
  tenant?: string | undefined;
}
export interface RuleDataCorrectionVO {
  /**
   * 设备id
   */
  deviceIds?: null | string;
  id?: number | null;
  /**
   * 指标编码
   */
  ruleNormCode?: null | string;
  /**
   * 状态
   */
  status?: null | string;
  /**
   * 值
   */
  value?: null | string;
}

export interface OfflineService {
  ipcUrl?: string | null;
  ipcAccount?: string | null;
  ipcPassword?: string | null;
  iotUrl?: string | null;
  iotAccount?: string | null;
  iotPassword?: string | null;
}

export interface MqttService {
  ipcUrl?: string | null;
  ipcAccount?: string | null;
  ipcPassword?: string | null;
}
export enum CorrectState {
  INVAILD = 'INVAILD', // 无效
  VAILD = 'VAILD', // 有效
}
export interface Correct {
  deviceId?: string | null | undefined;
  deviceName?: string | null | undefined;
  normCode?: string | null | undefined;
  normName?: string | null | undefined;
  correctValue?: string | number | null | undefined;
  handleUserName?: string | null | undefined;
  handleTime?: string | null | undefined;
  state?: CorrectState;

  prodId?: string | null | undefined;
  prodName?: string | null | undefined;
  deviceIds?: string | null | undefined;
  ruleNormList?: RuleNormParam[] | null | undefined;
  productPropVoList?: ProductProp[];
  device?: {
    productId?: string;
    productName?: string;
    deviceList: {
      id?: string;
      deviceId?: string;
      name?: string;
      deviceName?: string;
    }[];
  };
}
export interface ProductProp {
  propCode?: string;
  propName?: string;
  dataType?: string;
  precision?: number;
  unitName?: string;
  dataWrite?: number;
  dataConstraint?: { label: string;value: string | number | boolean; }[];
  isTelemetry?: unknown;
  remark?: string;
}
export interface MedicalOverrunAlarmRecordVO {
  depId?: number;
  depName?: string;
  deviceId?: number;
  deviceName?: string;
  monitoringTime?: number;
  recordData?: MedicalNormRecord[];
  status?: string;
  tenant?: number;
  tenantName?: string;
}

export interface MedicalNormRecord {
  /**
   * 指标编码
   */
  normCode?: string;
  normName?: string;
  unit?: string;
  /**
   * 指标值
   */
  value?: string;
  status?: string;
}
export interface MedicalIotRealTimeDataVO {
  /**
   * 指标值
   */
  data?: MedicalIotRealTimeDataDetails[];
  recordData?: MedicalIotRealTimeDataDetails[];
  /**
   * 所属部门
   */
  depId?: number;
  depName?: string;
  /**
   * 设备id
   */
  deviceId?: string;
  id?: string;
  deviceName?: string;
  /**
   * 指标状态
   */
  deviceStatus?: string;
  status?: string;
  /**
   * 企业名称
   */
  tenantName?: string;
}
export interface MedicalIotRealTimeDataDetails {
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  deviceId?: number;
  deviceName?: string;
  id?: number;
  ruleNormCode?: string;
  ruleNormName?: string;
  normName?: string;
  normCode?: string;
  status?: string;
  tenant?: number;
  updateBy?: string;
  updateTime?: string;
  unit?: string;
  value?: number;
}

export interface MedicalOverrunAlarmHistoryRecordVO {
  /**
   * 所属部门
   */
  depId?: number;
  depName?: string;
  /**
   * 设备id
   */
  deviceId?: number;
  deviceName?: string;
  /**
   * 记录时间
   */
  monitoringTime?: number;
  prodId?: number;
  /**
   * 指标数据
   */
  recordData?: MedicalNormRecord[];
  /**
   * 设备状态
   */
  status?: string;
  /**
   * 企业编号
   */
  tenant?: number;
  tenantName?: string;
}
export interface RuleNormVO {
  deviceids?: string;
  /**
   * 是否展示
   */
  display?: number;
  id?: number;
  /**
   * 下限
   */
  lowerLimit?: number;
  normCode?: string;
  /**
   * 指标名称
   */
  normName?: string;
  prodId?: string;
  /**
   * 规则id
   */
  ruleId?: number;
  /**
   * 展示区域
   */
  showArea?: string;
  /**
   * 排序
   */
  sort?: number;
  tenant?: number;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 上限
   */
  upperLimit?: number;
}

/**
 * 超限时间单位
 */
export enum TimeUnit {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MICROSECONDS = 'MICROSECONDS',
  MILLISECONDS = 'MILLISECONDS',
  MINUTES = 'MINUTES',
  NANOSECONDS = 'NANOSECONDS',
  SECONDS = 'SECONDS',
}
export interface MedicalRuleNotifyConfigVO {
  /**
   * 通知通道
   */
  notifyChannels?: string;
  /**
   * 时间
   */
  times?: number;
  /**
   * 超限时间单位
   */
  timeUnit?: TimeUnit;
}
export interface MedicalRuleTriggerDetailVO {
  /**
   * 触发部门主键
   */
  departId: string;
  /**
   * 触发部门名称
   */
  departName: string;
  /**
   * 触发设备id
   */
  deviceId: string;
  /**
   * 触发设备名称
   */
  deviceName: string;
  id: string;
  /**
   * 指标记录信息
   */
  norms: TriggerNorm[];
  /**
   * 产品id
   */
  productId: string;
  /**
   * 规则主键
   */
  ruleId: string;
  /**
   * 规则名称
   */
  ruleName: string;
  tenantName: string;
  msgContent?: string;
  sendTime?: string;
  sourceTenantName?: string;
}

export interface TriggerNorm {
  /**
   * 下限值
   */
  lowerLimit?: string;
  /**
   * 指标值
   */
  normValue: string;
  /**
   * 上报时间
   */
  uploadTime: string;
  /**
   * 上限值
   */
  upperLimit?: string;
  normName: string;
  normCode: string;
  unit: string;
}

export interface MedicalDeviceHistoryStatisticsVO {
  /**
   * 异常
   */
  abnormalTotal?: number;
  /**
   * 设备编号
   */
  deviceId?: number;
  /**
   * 设备名称
   */
  deviceName?: string;
  /**
   * 无效
   */
  invalidTotal?: number;
  /**
   * 采集时间
   */
  monitoringTime?: string;
  /**
   * 正常
   */
  normalTotal?: number;
  /**
   * 数量
   */
  number?: number;
  /**
   * 状态
   */
  status?: string;
  /**
   * 总数
   */
  total?: number;
}

export interface  AllTenantPropertVO {
  productId: string;
  productName: string;
  propertyName: string;
  propertyCode: string;
  tenantId: string;
  propertyUnit: string;
  label: string;
  value: string;
}

export interface TestStandardVO {
  id: string;
  name: string;
  propertyNum?: number;
  standards: StandardVO[];
}

export interface StandardVO {
  id?: string;
  name: string;
  properties: {
    id?: string;
    productId: string;
    productName: string;
    propertyName: string;
    propertyCode: string;
    tenantId: string;
    propertyUnit: string;
    maxVal: number;
    minVal: number;
  }[]
}
export interface CompanyVO {
  /**
   * 检测倒计时
   */
  calibrationExpireDay?: number;
  /**
   * 校准期到期时间。
   */
  calibrationExpireTime?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 检测地址。
   */
  detectionAddress?: string;
  /**
   * 检测公司。
   */
  detectionCompany?: string;
  /**
   * 检测电话。
   */
  detectionPhone?: string;
  /**
   * 检测的印章文件id。
   */
  detectionStampFileId?: string | null;
  /**
   * 检测声明。
   */
  detectionStatement?: string;
  /**
   * 印章文件对象
   */
  fileVO?: FileVOState;
  fileVOS?: FileVOState[];
  id?: number;
  /**
   * 模板内容
   */
  templateContent?: string;
  /**
   * 受检租户id。
   */
  tenantId?: number | string;
  /**
   * 受检单位名称。
   */
  tenantName?: string;
}

export interface DetectionReportVO {
  /**
   * 检测公司。
   */
  company?: string;
  /**
   * 检测日期。
   */
  detectionDate?: string;
  id?: number;
  /**
   * 编号。
   */
  no?: string;
  code?: string;
  /**
   * 受检租户名。
   */
  tenantName?: string;
}
/**
 * 报告入参
 */
export interface DetectionReportCommandParam {
  /**
   * 设备id集合
   */
  deviceIdList?: (number | string)[] | undefined;
  /**
   * 标准项目树形集合
   */
  list?: StandardTreeVO[] | undefined;
  /**
   * 时间段
   */
  period?: string | undefined;
}


export interface StandardTree {
  id: string;
  name: string | undefined;
  parentId: number | undefined;
  basicId?: number | undefined;
  basicName?: string | undefined;
  maxVal?: number | undefined;
  minVal?: number | undefined;
  productId?: number | undefined;
  productName?: string | undefined;
  productPropertyCode?: string | undefined;
  productPropertyName?: string | undefined;
  productPropertyTenant?: number | undefined;
  productPropertyUnit?: string | undefined;
  children: StandardTree[];
}
/**
* 检测标准树对象
*/
export interface StandardTreeVO {
  /**
   * 依据id
   */
  basicId?: number | undefined;
  basicName?: string | undefined;
  /**
   * id
   */
  id?: number | undefined;
  /**
   * 名称
   */
  name?: string | undefined;
  /**
   * 检测项目集合
   */
  propertyList?: PropertyVO[];
  children?: PropertyVO[];
}
export interface PropertyVO {
  /**
   * 检测依据id。
   */
  basicId?: number | undefined;
  id?: number | undefined;
  name?: string | undefined;
  /**
   * 阈值上限
   */
  maxVal?: number | undefined;
  /**
   * 阈值下限
   */
  minVal?: number | undefined;
  productId?: number | undefined;
  productName?: string | undefined;
  /**
   * 产品属性code。
   */
  productPropertyCode?: string | undefined;
  /**
   * 属性名称。
   */
  productPropertyName?: string | undefined;
  /**
   * 产品属性租户id。
   */
  productPropertyTenant?: number | undefined;
  /**
   * 产品属性单位
   */
  productPropertyUnit?: string | undefined;
}

/**
* 检测报告
*/
export interface ReportRecord {
  /**
   * 检测区域。
   */
  area?: string;
  /**
   * 依据名称。
   */
  basicName?: string;
  /**
   * 编码。
   */
  code?: string;
  /**
   * 检测公司。
   */
  company?: string;
  /**
   * 检测公司地址。
   */
  companyAddress?: string;
  /**
   * 创建用户
   */
  createBy?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 是否已删除
   */
  deleted?: boolean;
  /**
   * 检测日期。
   */
  detectionDate?: string;
  /**
   * 检测时间范围。
   */
  detectionDatePeriod?: string;
  id?: number | string;
  /**
   * 检测电话。
   */
  phone?: string;
  /**
   * 检测项目。
   */
  propertyName?: string;
  /**
   * 采样信息列表。
   */
  reportStampInfoList?: ReportStampInfoDTO[];
  /**
   * 结果评价。
   */
  resultAppraise?: string;
  /**
   * 序号
   */
  sort?: number;
  /**
   * 检测数据源列表。
   */
  sourceList?: string;
  /**
   * 采样信息列表。
   */
  stampInfoList?: string;
  /**
   * 检测声明。
   */
  statement?: string;
  /**
   * 租户编号
   */
  tenant?: number;
  /**
   * （受检地址）租户地址。
   */
  tenantAddress?: string;
  /**
   * 受检单位
   */
  tenantName?: string;
  /**
   * 更新用户
   */
  updateBy?: string;
  /**
   * 更新时间
   */
  updateTime?: string;
  [key: string]: unknown;
}

/**
* 报告采样信息
*
*/
export interface ReportStampInfoDTO {
  /**
   * 设备id
   */
  deviceId?: number;
  /**
   * 设备名称
   */
  deviceName?: string;
  /**
   * 每个属性校验数据
   */
  propCheckList?: PropCheck[];
  /**
   * 设备校验是否合格
   */
  qualifiedBool?: boolean;
}

export interface PropCheck {
  max?: string;
  /**
   * 技术要求
   */
  maxMin?: string;
  min?: string;
  /**
   * 属性code
   */
  propCode?: string;
  /**
   * 属性名称
   */
  propName?: string;
  /**
   * 单项结论
   */
  result?: string;
  /**
   * 属性名称
   */
  unitName?: string;
  /**
   * 检测结果
   */
  value?: number;
}
export interface ReportDataState {
  pdfUrl: string;
  filename: string;
  blob: Blob | null;
}