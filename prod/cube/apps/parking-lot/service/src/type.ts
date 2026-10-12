export interface PageResult<T> {
  records: T[];
  pages: number;
  total: number;
}
/**
 * 车场车位汇总信息
 */
export interface ParkingLotVO {
  /**
   * 车位使用总数
   */
  totalInNum?: number;
  /**
   * 车位总数
   */
  totalNum?: number;
  /**
   * 剩余总数
   */
  totalSpaceNum?: number;
}
/**
 * 车位信息返回参数
 */
export interface ParkingInfoVO {
  /**
   * 区域id
   */
  areaId?: string;
  /**
   * 区域名称
   */
  areaName?: string;
  modelArea?: string;
  /**
   * 车场编号
   */
  code?: string;
  id?: number;
  /**
   * 车场名称
   */
  name?: string;
  /**
   * 车位使用总数
   */
  totalInNum?: number;
  /**
   * 车位总数
   */
  totalNum?: number;
  /**
   * 剩余总数
   */
  totalSpaceNum?: number;
}
/**
 * 车场监控信息列表
 */
export interface ParkingMonitorVO {
  /**
   * 车场编号
   */
  code?: string;
  /**
   * 设备集合
   */
  devices?: DevicePageInfoVO[];
  id?: number;
  /**
   * 车场名称
   */
  name?: string;
  /**
   * 车位使用总数
   */
  totalInNum?: number;
  /**
   * 车位总数
   */
  totalNum?: number;
  /**
   * 剩余总数
   */
  totalSpaceNum?: number;
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
/**
 * 视角配置
 */
export interface ParkingInfoVisualVO {
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
export interface ParkingAccessTotal {
  /**
   * 入数量
   */
  inNum: string;
  /**
   * 出数量
   */
  outNum: string;
}

export interface ParkingAccessTrend {
  inTrendVOS: InTrendVO[];
  /**
   * 出场趋势
   */
  outTrendVOS: OutTrendVO[];
}

export interface InTrendVO {
  /**
   * 数量
   */
  num: string;
  /**
   * 时间点
   */
  period: string;
}

export interface OutTrendVO {
  /**
   * 数量
   */
  num: string;
  /**
   * 时间点
   */
  period: string;
}
export interface StatisticalChartVO {
  /**
   * value
   */
  series?: StatisticalChartListVO[] | null;
  /**
   * table
   */
  xdata?: string[] | null;
}

/**
* 柱状图数据实体
*
* StatisticalChartListVO
*/
export interface StatisticalChartListVO {
  /**
   * 图形Y轴名称
   */
  name?: null | string;
  /**
   * 环比
   */
  ringRatio?: number | null;
  /**
   * 线总数据
   */
  total?: number | null;
  /**
   * 图形Y轴值
   */
  value?: number[] | null;
}
/**
 * 车场详情
 */
export interface ParkingInfoDetailVO {
  /**
   * 车场地址
   */
  address?: string;
  /**
   * 区域id
   */
  areaId?: string;
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * 车场编号
   */
  code?: string;
  /**
   * 车场图片
   */
  files?: FileVO[];
  id?:    number;
  /**
   * 模型区域
   */
  modelArea?: string;
  /**
   * 车场名称
   */
  name?: string;
  /**
   * 车场备注
   */
  remarks?: string;
  /**
   * 车场来源
   */
  source?: string;
  /**
   * 车位使用总数
   */
  totalInNum?: number;
  /**
   * 车位总数
   */
  totalNum?: number;
  /**
   * 剩余总数
   */
  totalSpaceNum?: number;
}

/**
* com.guhecloud.cube.base.file.client.vo.FileVO
*
* FileVO
*/
export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
  createTime?:  string;
  /**
   * 内网地址
   */
  endpointPath?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 文件名
   */
  name?: string;
  /**
   * URL地址
   */
  path?: string;
  /**
   * 关联数量
   */
  refCount?: number;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
}

/**
* DevicePageInfoVO
*/
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

export interface IllegalParkingBlacklistVO {
  /**
   * 加入时间
   */
  createTime?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 车主
   */
  owner?: string;
  /**
   * 联系电话
   */
  phone?: string;
  /**
   * 车牌号
   */
  plateNumber?: string;
  /**
   * 车牌颜色
   */
  plateColor?: string;
  /**
   * 加入原因
   */
  reason?: string;
  /**
   * 违停扣分
   */
  violationScore?: number;
}

export interface VehiclePenaltyRecordVO {
  /**
   * 违停时间
   */
  illegalTime?: string;
  /**
   * 车主姓名
   */
  ownerName?: string;
  /**
   * 车主电话
   */
  ownerPhone?: string;
  /**
   * 车牌号
   */
  plateNumber?: string;
  /**
   * 违停工单ID
   */
  processInstanceId?: string;
  processInstanceName?: string;
  worKOrderName?: string;
  /**
   * 违停扣分
   */
  violationScore?: number;
}

export interface BlacklistConfigVO {
  /**
   * 比较条件
   */
  comparisonCondition?: string;
  id?: number;
  /**
   * 违停阈值
   */
  thresholdValue?: number;
}


export interface IllegalParkingRecordVO {
  /**
   * 当前激活节点处理用户
   */
  activeNodeAssignee?: string;
  /**
   * 当前激活节点名称
   */
  activeNodeName?: string;
  /**
   * 业务类型
   */
  businessType?: string;
  /**
   * 工单号
   */
  code?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 当前用户处理的任务id
   */
  currentTaskId?: string;
  /**
   * 表单实例id
   */
  formInstanceId?: number;
  /**
   * 表单单号，未来需要解耦
   */
  formNo?: { [key: string]: any };
  /**
   * 违停程度
   */
  illegalLevel?: string;
  /**
   * 流程实例名称
   */
  instanceName?: string;
  /**
   * 最后任务完成时间
   */
  lastTaskCompletedTime?: string;
  /**
   * 工单名称
   */
  name?: string;
  /**
   * 车主姓名
   */
  ownerName?: string;
  /**
   * 车主电话
   */
  ownerPhone?: string;
  /**
   * 车牌号
   */
  plateNumber?: string;
  /**
   * 流程实例id
   */
  processInstanceId?: string;
  /**
   * 启动用户id
   */
  startUserId?: number;
  /**
   * 启动用户信息
   */
  startUserInfo?: StartUserInfo;
  /**
   * 启动用户名称
   */
  startUserName?: string;
  /**
   * 流程实例的状态
   */
  status?: string;
  /**
   * 提交时间
   */
  submitedTime?: string;
  /**
   * 最后修改时间
   */
  updateTime?: string;
  /**
   * 变量
   */
  variables?: MapObject;
}

/**
* 启动用户信息
*
* StartUserInfo
*/
export interface StartUserInfo {
  organizationId?: number;
  organizationName?: string;
  startUserId?: number;
  startUserName?: string;
}

/**
* 变量
*
* MapObject
*/
export interface MapObject {
  key?: { [key: string]: any };
}
export interface IllegalParkingConfigVO {
  id?: number;
  /**
   * 违停程度
   */
  illegalLevel?: IllegalLevel;
  /**
   * 扣分值
   */
  score?: number;
  /**
   * 统计周期
   */
  timeCycle?: string;
}

/**
* 违停程度
*/
export enum IllegalLevel {
  Fatal = "FATAL",
  General = "GENERAL",
  Light = "LIGHT",
  Serious = "SERIOUS",
}
export interface VehicleInfoVO {
  createBy?: string;
  createTime?: string;
  /**
   * 车主联系手机号
   */
  customerMobile?: string;
  /**
   * 车主姓名
   */
  customerName?: string;
  deleted?: boolean;
  fileIdList?: number[];
  id?: number;
  /**
   * 是否加入黑名单
   */
  isBlacklist?: boolean;
  tenant?: number;
  updateBy?: string;
  updateTime?: string;
  /**
   * 车牌号码
   */
  vehicleNo?: string;
  /**
   * 车牌颜色
   */
  vehicleNoColor?: string;
  /**
   * 车辆类型编号
   */
  vehicleTypeCode?: string;
  /**
   * 车辆类型名称
   */
  vehicleTypeName?: string;
}
export interface VehicleInfoDetailVO {
  /**
   * 车主联系手机号
   */
  customerMobile?: string;
  /**
   * 车主姓名
   */
  customerName?: string;
  /**
   * 文件
   */
  fileVOList?: FileVO[];
  fileList?: FileVO[];
  id?: number;
  /**
   * 车牌号码
   */
  vehicleNo?: string;
  /**
   * 车牌颜色
   */
  vehicleNoColor?: string;
  /**
   * 车辆类型编号
   */
  vehicleTypeCode?: string;
  /**
   * 车辆类型名称
   */
  vehicleTypeName?: string;
}

export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
  createTime?: string;
  /**
   * 内网地址
   */
  endpointPath?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 文件名
   */
  name?: string;
  /**
   * URL地址
   */
  path?: string;
  /**
   * 关联数量
   */
  refCount?: number;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
}
export interface VehicleTypeVO {
  id?: number;
  name?: string;
}

export interface VehicleGuideBoardConfigVO {
  /**
   * 编码
   */
  code?: string;
  /**
   * 引导内容配置列表（详情接口返回）
   */
  contentConfigs?: GuideContentConfigVO[];
  /**
   * 主键
   */
  id?: number;
  /**
   * 安装位置
   */
  installationLocation?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 车场信息
   */
  parkingInfo?: ParkingInfoVO;
  /**
   * 关联车场id
   */
  parkingLotId?: number;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 现场图片文件列表（详情接口返回）
   */
  sceneImageFiles?: FileVO[];
  /**
   * 现场图片文件id（多个，逗号分隔）
   */
  sceneImageIds?: string;
}

/**
* 引导内容配置 VO
*
* GuideContentConfigVO
*/
export interface GuideContentConfigVO {
  /**
   * 绑定字段
   */
  boundField?:  string | number | undefined;
  /**
   * 内容名称
   */
  contentName?: string | undefined;
  /**
   * 字体颜色
   */
  fontColor?: string | number | undefined;
  /**
   * 字体大小
   */
  fontSize?: number | undefined;
  /**
   * 主键
   */
  id?: string | number | undefined;
  /**
   * 优先级
   */
  priority?: number | undefined;
}

/**
* 车场信息
*
* ParkingInfoVO
*/
export interface ParkingInfoVO {
  /**
   * 区域id
   */
  areaId?: string;
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * 车场编号
   */
  code?: string;
  id?: number;
  /**
   * 模型区域
   */
  modelArea?: string;
  /**
   * 车场名称
   */
  name?: string;
  /**
   * 车位使用总数
   */
  totalInNum?: number;
  /**
   * 车位总数
   */
  totalNum?: number;
  /**
   * 剩余总数
   */
  totalSpaceNum?: number;
}

/**
 * 引导内容配置参数
 *
 * GuideContentConfigParam
 */
export interface GuideContentConfigParam {
  /**
   * 绑定字段
   */
  boundField?: string;
  /**
   * 内容名称
   */
  contentName?: string;
  /**
   * 字体颜色
   */
  fontColor?: string;
  /**
   * 字体大小
   */
  fontSize?: number;
  /**
   * 主键（更新时必传）
   */
  id?: number;
  /**
   * 优先级
   */
  priority?: number;
}
export interface ParkingAccessRecordsVO {
  /**
   * 通行时间
   */
  accessTime: string;
  /**
   * 出入标识
   */
  accessType: AccessType;
  /**
   * 通道名称
   */
  channelName: string;
  /**
   * 通道号
   */
  channelNo: string;
  id: string;
  /**
   * 通行唯一标识
   */
  identifyId: string;
  /**
   * 图片base64
   */
  imageBase: string;
  /**
   * 图片路径
   */
  imageUrl: string;
  /**
   * 车场编号
   */
  parkingInfoCode: string;
  /**
   * 车场名称
   */
  parkingInfoName: string;
  /**
   * 车牌号
   */
  vehicleNo: string;
}

/**
* 出入标识
*/
export enum AccessType {
  ACCESS_IN = "ACCESS_IN",
  ACCESS_OUT = "ACCESS_OUT",
}
