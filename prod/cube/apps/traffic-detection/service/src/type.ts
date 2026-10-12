/**
 * 人流量数
 */
export interface TrafficDetectionPersonTotalStatVO {
  /**
   * 人流量总数
   */
  totalNumber?: number;
}
/**
 * 区域人流量列表
 *
 */
export interface TrafficDetectionAreaListStatVO {
  id?: number;
  /**
   * 名称
   */
  name?: string;
  modelArea?: string;
  /**
   * 人流量总数
   */
  totalPersonNumber?: number;
}
/**
 * 人流量趋势列表
 */
export interface TrafficDetectionTrendStatVO {
  /**
   * 时间点
   */
  period?: string;
  /**
   * 人流量数量
   */
  totalPersonNumber?: number;
}
/**
 * 区域人流统计趋势列表
 */
export interface TrafficDetectionAreaTrendStatVO {
  id?: number | string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 备注
   */
  remarks?: string;
  remark?: string;
  /**
   * 时间点
   */
  period?: string;
  /**
   * 人流量
   */
  totalPersonNumber?: number;
}
/**
 * 人流统计汇总
 */
export interface TrafficDetectionPersonFlowSummaryVO {
  /**
   * 累计人次
   */
  totalPersonNumber?: number;
  /**
   * 累计人次环比
   */
  totalMomRate?: number;
  /**
   * 累计人次同比去年
   */
  totalYoyRate?: number;
  /**
   * 平均人次
   */
  avgPersonNumber?: number;
  /**
   * 峰值在场人次
   */
  peakPersonNumber?: number;
  /**
   * 峰值出现时间
   */
  peakPeriod?: string;
}
/**
 * 区域人流排行
 */
export interface TrafficDetectionAreaPersonFlowRankVO {
  id?: number | string;
  /**
   * 区域名称
   */
  name?: string;
  modelArea?: string;
  /**
   * 累计人次
   */
  totalPersonNumber?: number;
  /**
   * 平均人次
   */
  avgPersonNumber?: number;
  /**
   * 峰值人数
   */
  peakPersonNumber?: number;
}

export interface TrafficDetectionAreaPersonFlowRankVOList {
  pages: number;
  total: number;
  records: TrafficDetectionAreaPersonFlowRankVO[];
}
/**
 * 流量检测设备统计列表
 */
export interface TrafficDetectionDeviceStatVO {
  /**
   * 设备id
   */
  id?: number;
  /**
   * 设备名称
   */
  name?: string;
  /**
   * 总人流量数量
   */
  totalPersonNumber?: number;
  deviceConfig?: string;
}
/**
 * 人流区域监控信息列表
 */
export interface TrafficDetectionAreaMonitorVO {
  /**
   * 设备集合
   */
  devices?: DeviceBaseArchivesInfoDTO[];
  id?: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 备注
   */
  remark?: string;
}

/**
 * DeviceBaseArchivesInfoDTO
 */
export interface DeviceBaseArchivesInfoDTO {
  /**
   * 区域信息
   * key: 区域id
   * value: 区域名称
   */
  area?: PairString;
  /**
   * 设备编码
   */
  code?: string;
  /**
   * 部门信息
   * key: 部门id
   * value: 部门名称
   */
  department?: PairString;
  /**
   * 设备id
   */
  id?: number;
  /**
   * 设备管理员
   */
  managerIds?: number[];
  /**
   * 设备名称
   */
  name?: string;
  /**
   * 设备图片
   */
  picture?: number;
  /**
   * 设备状态
   */
  status?: Status;
  tenant?: number;
  /**
   * 三方配置
   */
  thirdpartyCfg?: string;
  /**
   * 三方设备id
   */
  thirdPartyId?: string;
}

/**
 * 区域信息
 * key: 区域id
 * value: 区域名称
 *
 * PairString
 *
 * 部门信息
 * key: 部门id
 * value: 部门名称
 */
export interface PairString {
  key?: number;
  val?: string;
}

/**
 * 设备状态
 *
 * Status
 */
export interface Status {
  /**
   * 最后通信时间
   */
  communicationTime?: string;
  /**
   * 在线状态
   */
  onlineState?: boolean;
}
/**
 * 视角配置
 */
export interface TrafficDetectionAreaVisualVO {
  /**
   * 中心位置
   */
  centerAddress?: string;
  /**
   * 隐藏楼栋
   */
  hiddenBuilding?: string;
  /**
   * 视角参数
   */
  visualConfig?: string;
}

export interface DevicePageInfoVO {
  /**
   * 区域信息
   */
  area?: AreaBaseInfoDTO;
  areaId?: string;
  areaName?: string;
  /**
   * 设备编码
   */
  code?: string;
  department?: IdToName;
  departmentIds?: number[];
  departmentNames?: string;
  id?: number;
  lntAndLat?: string;
  /**
   * 设备名称
   */
  name?: string;
  picture?: number;
  productInfo?: DeviceProductInfoDTO;
  /**
   * 设备状态
   */
  status?: Status;
  /**
   * 标签ID
   */
  tagIds?: number[];
  /**
   * 标签名称
   */
  tagNames?: string;
  thirdPartyId?: string;
  trafficDetectionAreaConfig: TrafficDetectionAreaConfig;
  typeId?: string;
  typeName?: string;
}

/**
 * 区域信息
 *
 * AreaBaseInfoDTO
 */
export interface AreaBaseInfoDTO {
  id?: number;
  name?: string;
  pathId?: string;
  pathName?: string;
}

/**
 * IdToName
 */
export interface IdToName {
  id?: number;
  name?: string;
}

/**
 * DeviceProductInfoDTO
 */
export interface DeviceProductInfoDTO {
  /**
   * 产品品牌名称
   */
  brandName?: string;
  /**
   * 产品图标
   */
  icon?: number;
  /**
   * 产品id
   */
  id?: number;
  /**
   * 产品型号名称
   */
  modelName?: string;
  /**
   * 产品名称
   */
  name?: string;
  /**
   * 产品图片
   */
  picture?: number;
  /**
   * 产品品类信息
   */
  productCategory?: ProductCategory;
}

/**
 * 产品品类信息
 *
 * ProductCategory
 */
export interface ProductCategory {
  /**
   * 产品品类编号
   */
  code?: string;
  /**
   * 产品品类名称
   */
  name?: string;
  /**
   * 全路径code
   */
  pathCode?: string;
}

/**
 * 设备状态
 *
 * Status
 */
export interface Status {
  /**
   * 最后通信时间
   */
  communicationTime?: string;
  /**
   * 在线状态
   */
  onlineState?: boolean;
}

export interface TrafficDetectionAreaConfig {
  /**
   * 人流区域设备配置
   */
  deviceConfig: string;
}
