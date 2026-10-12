/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export type BusinessType = 'STALL_TYPE' | 'STALL' | 'DEVICE_PROD_CATEGORY_CODE' | 'DEVICE'

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
  productId: string;
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
  prodIconFile?: { id: string;path: string; };
  /**
   * 产品型号
   */
  prodModel: string;
  prodName: string;
  /**
   * 产品图片
   */
  prodPic?: number;
  prodPicFile?: { id: string;path: string; };
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
  department?: { id: string;name: string; };
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
export interface ReservePageVO {
  id: string;
  conferenceDevice: string;
  conferenceName: string;
  createTime: string;
  departmentName: string;
  operate: string;
  timeInterval: string;
  userName: string;
  bookStatus:string
}
/**
 * 会议物品表
 *
 * ConferenceGoods
 */
export interface MeetGoods {
  /**
   * 区域id
   */
  areaId?: number | null;
  /**
   * 区域名称
   */
  areaName?: null | string;
  createBy?: null | string;
  createTime?: null | string;
  deleted?: boolean | null;
  /**
   * 物品名称
   */
  goodsName?: null | string;
  id?: string | null;
  /**
   * 说明
   */
  illustrate?: null | string;
  tenant?: number | null;
  updateBy?: null | string;
  updateTime?: null | string;
}
export interface MeetType{
  id: string; 
  name: string;
  status: boolean;
}
export interface MeetRoomType{
  id: string; 
  name: string;
  status: boolean;
}

export interface AppointmentDetailState {
  appointmentDate?: null | string;
  /**
   * 预约详情
   */
  appointmentDetails?: AppointmentDetailsVo[] | null;
  /**
   * 区域id
   */
  areaId?: number | null;
  /**
   * 区域名称
   */
  areaName?: null | string;
  /**
   * 可容纳人数
   */
  capacity?: number | null;
  /**
   * 可预约状态
   */
  conferenceBookStatus?: ConferenceBookStatus;
  /**
   * 会议室id
   */
  conferenceId?: number | null;
  deviceName?: null | string;
  /**
   * 会议室名称
   */
  name?: null | string;
  /**
   * 可预约时间段
   */
  period?: null | string;
}

export interface AppointmentDetailsVo {
  /**
   * 预约id
   */
  bookId?: number | null;
  /**
   * 预约状态
   */
  bookStatus?: BookStatus;
  /**
   * 会议室id
   */
  conferenceId?: number | null;
  /**
   * 时段
   */
  timeInterval?: null | string;
  active?: boolean | null;
}

/**
* 预约状态
*/
export enum BookStatus {
  BeingUsed = "BEING_USED",
  CancelReservation = "CANCEL_RESERVATION",
  Expire = "EXPIRE",
  Finish = "FINISH",
  Reservable = "RESERVABLE",
  Reserved = "RESERVED",
}

/**
* 可预约状态
*/
export enum ConferenceBookStatus {
  Avaliable = "AVALIABLE",
  Noappointment = "NOAPPOINTMENT",
}
export interface MyAppointment {
  /**
   * 预约日期
   */
  appointmentDate?: null | string;
  /**
   * 所属区域
   */
  areaName?: null | string;
  /**
   * 预约人数
   */
  bookNum?: number | null;
  /**
   * 会议id
   */
  conferenceId?: number | null;
  /**
   * 会议名称
   */
  conferenceName?: null | string;
  /**
   * 会议内容
   */
  content?: null | string;
  /**
   * 会议室设备
   */
  deviceName?: null | string;
  /**
   * bookId
   */
  id?: number | null;
  /**
   * 是否可以取消
   */
  isCancel?: boolean | null;
  /**
   * 状态
   */
  status?: BookStatus;
  /**
   * 预约人id
   */
  subscribePerson?: number | null;
  /**
   * 预约人
   */
  subscribePersonName?: null | string;
  /**
   * 时间段
   */
  timeInterval?: null | string;
}
export interface FieldConfigurationVO {
  fieldName?: null | string;
  fieldCode?: null | string;
  id?:  string | number | null;
  required?: boolean | null;
  hidden?: boolean | null;
}
export interface ReservationInfo{
  areaName: string;
  showConferenceType: boolean;
  showParticipantType: boolean;
  showDeptSelect: boolean;
  showRoleSelect: boolean;
  loading: boolean;
  goodIds: string[];
  formState: ReservationFormState;
  conferenceTypeOptions: { text: string;value: string;disabled: boolean; }[];
  participantTypeOptions: { text: string;value: string; }[];
  conferenceGoodsOptions: { text: string;value: string | null; }[];
  detail: AppointmentDetailState | null;
  conferenceName?: string | null;
  appointmentDate?: string | null;
}
export interface ReservationFormState {
  bookNum?: number | null;
  conferenceId?: number | null;
  conferenceTheme?: null | string;
  conferenceType?: null | string;
  content?: null | string;
  fieldConcatenation?: null | string;
  goodsIds?: null | string;
  goodsNames?: null | string;
  subscribePerson?: number | null;
  timeInterval?: null | string;
  conferenceTypeName?: null | string;
  participantType?: string | null;
  participantTypeText?: string | null;
  participantIds?: string | null;
  dep?: string | null;
  depName?: string | null;
  role?: string | null;
  roleName?: string | null;
  users?: string;
  userNames?: string[] | string;
}
export interface BookRoomDetail {
    /**
     * 时间
     */
    appointmentDate?: null | string;
    /**
     * 会议室区域
     */
    areaName?: null | string;
    /**
     * 预约人数
     */
    bookNum?: number | null;
    /**
     * 取消原因
     */
    cancelReason?: null | string;
    /**
     * 会议室设备
     */
    conferenceDevices?: null | string;
    /**
     * 会议id
     */
    conferenceId?: number | null;
    /**
     * 会议名称
     */
    conferenceName?: null | string;
    /**
     * 会议主题
     */
    conferenceTheme?: null | string;
    /**
     * 会议类型
     */
    conferenceType?: null | string;
    /**
     * 内容
     */
    content?: null | string;
    /**
     * 会议物品
     */
    goodsIds?: null | string;
    /**
     * 会议物品名称
     */
    goodsNames?: null | string;
    id?: number | null;
    /**
     * 是否能取消
     */
    isCancel?: boolean | null;
    /**
     * 部门
     */
    organization?: Organization;
    /**
     * 状态
     */
    status?: BookStatus;
    /**
     * 预约人id
     */
    subscribePerson?: number | null;
    /**
     * 预约人
     */
    subscribePersonName?: null | string;
    /**
     * 时间段
     */
    timeInterval?: null | string;
    userNames?: null | string;
    participantList?: ConferenceBaseEntityVO[];
    participantType?: BookPersonType;
}

/**
 * 部门
 *
 * Organization
 */
export interface Organization {
    /**
     * 组织机构主键
     */
    id?: number | null;
    /**
     * 组织机构名称
     */
    name?: null | string;
}


/**
 * 获取会议室预约情况（外部调用）
 */
export interface BookRoomAppointmentVo {
  /**
   * 是否可预约(true可以预约，false不能预约)
   */
  appointment?: boolean | null;
  /**
   * 所属区域名
   */
  areaName?: null | string;
  /**
   * 可容纳人数
   */
  capacity?: number | null;
  conferenceBookStatus?: ConferenceBookStatus;
  /**
   * 会议室id
   */
  conferenceId?: string | number | null;
  conferenceName?: string | null;
  pages?: number | null;
  /**
   * 预约信息
   */
  records?: BookRoomAppointmentRecordVo[] | null;
  total?: number | null;
}

/**
* 会议室预约信息
*/
export interface BookRoomAppointmentRecordVo {
  /**
   * 预约id
   */
  bookId?: number | null;
  /**
   * 人数
   */
  bookNum?: number | null;
  /**
   * 预约状态
   */
  bookStatus?: BookStatus;
  /**
   * 会议室
   */
  conferenceId?: string | number | null;
  /**
   * 会议主题
   */
  conferenceTheme?: null | string;
  /**
   * 会议类型
   */
  conferenceType?: null | string;
  /**
   * 部门
   */
  deptId?: number | null;
  deptName?: null | string;
  /**
   * 排序字段
   */
  sortTime?: SortDateTime;
  /**
   * 预约/使用状态
   */
  status?: null | string;
  /**
   * 预约人
   */
  subscribePerson?: number | null;
  /**
   * 时段
   */
  timeInterval?: null | string;
  /**
   * 预约人
   */
  userId?: number | null;
  userName?: null | string;
}

/**
* 排序字段
*/
export interface SortDateTime {
  /**
   * 一周的第一天，默认是周一， 在设置或获得 WEEK_OF_MONTH 或 WEEK_OF_YEAR 字段时，Calendar 必须确定一个月或一年的第一个星期，以此作为参考点。
   */
  firstDayOfWeek?: FirstDayOfWeek;
  /**
   * 第一周最少天数
   */
  minimalDaysInFirstWeek?: number | null;
  /**
   * 是否可变对象
   */
  mutable?: boolean | null;
  /**
   * 时区
   */
  timeZone?: unknown;
}

/**
* 一周的第一天，默认是周一， 在设置或获得 WEEK_OF_MONTH 或 WEEK_OF_YEAR 字段时，Calendar 必须确定一个月或一年的第一个星期，以此作为参考点。
*/
export enum FirstDayOfWeek {
  Friday = "FRIDAY",
  Monday = "MONDAY",
  Saturday = "SATURDAY",
  Sunday = "SUNDAY",
  Thursday = "THURSDAY",
  Tuesday = "TUESDAY",
  Wednesday = "WEDNESDAY",
}

export interface ConferenceInfoVo {
  /**
   * 管理员
   */
  administrators?: null | string;
  /**
   * 管理员名称
   */
  administratorsName?: null | string;
  /**
   * 区域id
   */
  areaId?: number | null;
  /**
   * 区域名称
   */
  areaName?: null | string;
  /**
   * 可容纳人数
   */
  capacity?: number | null;
  devicesVos?: DevicesVo[] | null;
  id?: string | number | null;
  /**
   * 会议室名称
   */
  name?: null | string;
  /**
   * 可预约时间段
   */
  period?: null | string;
  /**
   * 会议室状态
   */
  status?: number | null;
  statusBool?: boolean;
  bookPersonList?: ConferenceBaseEntityVO[];
  bookPersonType?: BookPersonType;
  conferenceRoomTypeId?: number | string ;
  conferenceRoomTypeName?: string;
}
export interface ConferenceBaseEntityVO {
  id?: number;
  name?: string;
  status?: boolean;
}

export enum BookPersonType {
  DEPARTMENT = "DEPARTMENT",
  ROLE = "ROLE",
  USER = "USER",
}

export interface DevicesVo {
  /**
   * 区域id
   */
  areaId?: number | null;
  /**
   * 区域名称
   */
  areaName?: null | string;
  /**
   * 会议室id
   */
  conferenceId?: number | null;
  /**
   * 设备编码
   */
  deviceCode?: null | string;
  /**
   * 设备id
   */
  deviceId?: number | null;
  /**
   * 设备型号
   */
  deviceModel?: null | string;
  /**
   * 主键id
   */
  id?: number | null;
  /**
   * 设备名称
   */
  name?: null | string;
  /**
   * 产品分类
   */
  type?: null | string;
}
export interface ConferenceDeviceAddOrUpdateParam {
  /**
   * 区域id
   */
  areaId?: number | null;
  /**
   * 区域名称
   */
  areaName?: null | string;
  conferenceId?: number | null;
  /**
   * 设备编码
   */
  deviceCode?: null | string;
  /**
   * 设备id
   */
  deviceId?: number | null;
  /**
   * 设备型号
   */
  deviceModel?: null | string;
  /**
   * 设备名称
   */
  name?: null | string;
  /**
   * 产品分类
   */
  type?: null | string;
}

export interface ConferenceGoods {
  /**
   * 区域id
   */
  areaId?: number | null;
  /**
   * 区域名称
   */
  areaName?: null | string;
  createBy?: null | string;
  createTime?: null | string;
  deleted?: boolean | null;
  /**
   * 物品名称
   */
  goodsName?: null | string;
  id?: number | null;
  /**
   * 说明
   */
  illustrate?: null | string;
  tenant?: number | null;
  updateBy?: null | string;
  updateTime?: null | string;
}
export interface FieldConfigurationVO {
  fieldCode?: null | string;
  fieldName?: null | string;
  id?: string | number | null;
  required?: boolean | null;
}

export interface RoomScreenConfigVO {
  /**
   * 鉴权信息
   */
  authInfo?: null | string;
  /**
   * 会议室id
   */
  conferenceId?: number | null;
  conferenceName?: null | string;
  createBy?: null | string;
  createTime?: null | string;
  deleted?: boolean | null;
  /**
   * 设备
   */
  deviceCode?: null | string;
  /**
   * 设备名称
   */
  deviceName?: null | string;
  /**
   * 展示状态
   */
  displayStatus?: null | DisplayStatus;
  displayStatusBool?: null | boolean;
  id?: string | number | null;
  /**
   * 发送节目任务id
   */
  jobId?: number | null;
  /**
   * 节目接口地址
   */
  programUrl?: null | string;
  tenant?: number | null;
  updateBy?: null | string;
  updateTime?: null | string;
}

/**
 * 展示状态
 */
export enum DisplayStatus {
  CLOSE = "CLOSE",
  OPEN = "OPEN",
}
export interface AppointmentVo {
  /**
   * 预约详情
   */
  appointmentDetails?: AppointmentReserveVo[] | null;
  /**
   * 会议室人数
   */
  capacity?: number | null;
  /**
   * 会议室id
   */
  conferenceId?: number | null;
  bookId?: string | null;
  /**
   * 会议室
   */
  conferenceName?: null | string;
  /**
   * 会议主题
   */
  conferenceTheme?: null | string;
  /**
   * 会议类型
   */
  conferenceType?: null | string;
}

export interface AppointmentReserveVo {
    /**
     * 预约id
     */
    bookId?: number | null;
    /**
     * 预约状态
     */
    bookStatus?: AppointmentReserveStatus;
    /**
     * 会议室id
     */
    conferenceId?: number | null;
    /**
     * 时段
     */
    timeInterval?: null | string;
    name?: null | string;
    color?: null | string;
}
export interface ChoiceVO {
  key: string;
  timeInterval: string;
  appointmentDetails?: AppointmentReserveVo[] | null;
  capacity?: number | null;
  conferenceId?: number | null;
  bookId?: string | number | null | undefined;
  conferenceName?: string | null;
  conferenceTheme?: string | null;
  conferenceType?: string | null;
  bookStatus?: AppointmentReserveStatus | null;
}
/**
* 预约状态
*/
export enum AppointmentReserveStatus {
  BeingUsed = "BEING_USED",
  CancelReservation = "CANCEL_RESERVATION",
  Expire = "EXPIRE",
  Finish = "FINISH",
  Reservable = "RESERVABLE",
  Reserved = "RESERVED",
  Approval = "APPROVAL",
  noReservable = "NO_RESERVABLE",
}
export interface BookRoomVo {
  /**
   * 时间
   */
  appointmentDate?: null | string;
  /**
   * 会议室区域
   */
  areaName?: null | string;
  /**
   * 预约人数
   */
  bookNum?: number | null;
  /**
   * 取消原因
   */
  cancelReason?: null | string;
  /**
   * 会议室设备
   */
  conferenceDevices?: null | string;
  /**
   * 会议id
   */
  conferenceId?: number | null;
  /**
   * 会议名称
   */
  conferenceName?: null | string;
  /**
   * 会议主题
   */
  conferenceTheme?: null | string;
  /**
   * 会议类型
   */
  conferenceType?: null | string;
  /**
   * 内容
   */
  content?: null | string;
  /**
   * 会议物品
   */
  goodsIds?: null | string;
  /**
   * 会议物品名称
   */
  goodsNames?: null | string;
  id?: number | null;
  /**
   * 是否能取消
   */
  isCancel?: boolean | null;
  /**
   * 部门
   */
  organization?: Organization;
  /**
   * 状态
   */
  status?: AppointmentReserveStatus;
  /**
   * 预约人id
   */
  subscribePerson?: number | null;
  /**
   * 预约人
   */
  subscribePersonName?: null | string;
  /**
   * 时间段
   */
  timeInterval?: null | string;
  participantList?: ConferenceBaseEntityVO[];
  participantType?: BookPersonType;
  bookId?: null | string;
}
export interface Organization {
  /**
   * 组织机构主键
   */
  id?: number | null;
  /**
   * 组织机构名称
   */
  name?: null | string;
}
export interface AppointmentUsageVo {
   name?: null | string;
   num?: null | string;
   timeInterval?: null | string;
}
export interface AppointmentCountVo {
   num?: null | string | number;
}

export interface AppointmentIdleVo {
   /**
    * 会议室名称
    */
   conferenceName?: null | string;
   /**
    * 空闲率
    */
   idleRate?: number | null;
}

export interface AppointmentIntervalLogVo {
  conferenceName?: null | string;
  conferenceNameLists?: ConferenceNameList[] | null;
}

export interface ConferenceNameList {
  intervalLogCount?: number | null;
  timeInterval?: null | string;
}
