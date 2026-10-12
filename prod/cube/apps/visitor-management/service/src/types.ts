import type { Dayjs } from 'dayjs'
/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export enum EnterOrExit {
  /**
   * 进出门类型，0 - 开门，1 - 进门，2 - 出门
   */
  OPEN = 0,
  ENTER = 1,
  OUT = 2,
}
export const colorDescriptions: Record<EnterOrExit, string> = {
  [EnterOrExit.OPEN]: '#02A7F0',
  [EnterOrExit.ENTER]: '#87d068',
  [EnterOrExit.OUT]: '#108ee9',
}
export interface PassRecord {
  deviceName: string;
  enterOrExit: number;
  /**
   * 主键id
   */
  id: number;
  /**
   * 通行人名称
   */
  personName: string;
  /**
   * 通行时间
   */
  swingTime: string;
}

export interface ReservationRecord {
  /**
   * 预约区域id
   */
  areaId: string;
  /**
   * 预约区域名称
   */
  areaName: string;
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 预约日期字符串
   */
  dayStr: string;
  /**
   * 结束时间
   */
  endTime: number;
  /**
   * 主键id
   */
  id: number;
  /**
   * 姓名
   */
  name: string;
  /**
   * 预约时间段字符串
   */
  periodStr: string;
  /**
   * 手机
   */
  phone: string;
  /**
   * 开始时间
   */
  startTime: number;
  /**
   * 状态，// 状态 0：待审核 1：预约 2：在访 3：离访 4:预约取消
   */
  status: number;
  timeStr: string;
}

export interface BlacklistRecord {
  /**
   * 主键id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 手机号
   */
  phone: string;
}
export interface LampRecord {
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 绑定设备数
   */
  deviceNumber: number;
  /**
   * 区域id
   */
  id: number;
  /**
   * 区域名称
   */
  name: string;
  /**
   * 访问时段
   */
  visitPeriods: string;
}
export interface FileState {
  businessKey?: string | null;
  id: string;
  name?: null | string;
  path?: null | string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}

export interface OSSFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
export interface BlackDetail {
  id: number | undefined;
  sex: string | undefined;
  phone: string;
  name: string;
  reason: string;
  pictures: OSSFile[];
  picturePath: string;
}
export interface BlackDetailVO {
  id: number | undefined;
  sex: string | undefined;
  phone: string;
  name: string;
  reason: string;
  pictures: string;
  picturePath: string;
}
export interface LampAreaDetail {
  /**
   * 区域名称
   */
  areaId: string | string[];
  areaName: string;
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 创建人名称
   */
  createUserName: string;
  id: string;
  /**
   * 日期段
   */
  visitDates: string;
  /**
   * 时间段
   */
  visitPeriods: string;
  detailList: DetailListState[];
}

export interface DetailListState {
  areaId?: number;
  areaName?: string;
  createTime?: number;
  /**
   * 结束日期
   */
  endDate?: number;
  /**
   * 结束日期字符串
   */
  endDateStr?: string;
  parentId?: string;
  /**
   * 开始日期
   */
  startDate?: number;
  /**
   * 开始日期字符串
   */
  startDateStr?: string;
  timeList?: TimeListState[];
  isDelete?: boolean;
}

export interface TimeListState {
  id?: string;
  /**
   * 剩余数量
   */
  remainNumber?: number;
  /**
   * 时间端
   */
  timeStr?: string;
  startTimeStr?: string;
  endTimeStr?: string;
  /**
   * 总数量
   */
  totalNumber?: number;
  key: string;
  nextKey?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
  nextDayBool?: number;
  isDelete?: boolean;
}

export interface TimeState {
  value?: [Dayjs, Dayjs] | undefined;
  key: string;
}
export interface TableState {
  timeList: {
    value?: [Dayjs, Dayjs] | undefined;
    key: string;
    nextKey?: string;
    totalNumber?: number | undefined;
    startTime?: Dayjs;
    endTime?: Dayjs;
    nextDayBool?: number;
  }[] | undefined;
  period: [Dayjs, Dayjs] | undefined;
}

export interface DetailList {
  period?: string | undefined;
  timeList?: { timeStr?: string | undefined; totalNumber?: number; nextDayBool?: number; startTimeStr?: string | undefined; endTimeStr?: string | undefined; }[];
}

export interface ReservationDetail {
  /**
   * 居住地址
   */
  address?: string;
  /**
   * 预约码
   */
  appointmentCode: string;
  /**
   * 区域code
   */
  areaCode?: string;
  /**
   * 区域id
   */
  areaId: number;
  /**
   * 区域名称
   */
  areaName: string;
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 日期字符串
   */
  dayStr?: string;
  /**
   * 单位
   */
  dw?: string;
  /**
   * 预约结束时间
   */
  endTime: number;
  /**
   * 人脸图片
   */
  faceFile?: string;
  /**
   * id
   */
  id: number;
  /**
   * 预约人
   */
  name: string;
  /**
   * 访问人数
   */
  personSum?: number;
  /**
   * 手机
   */
  phone: string;
  /**
   * 说明
   */
  reason?: string;
  /**
   * 预约开始时间
   */
  startTime: number;
  /**
   * 状态// 状态 0：待审核 1：预约 2：在访 3：离访 4:预约取消
   */
  status: number;
  /**
   * 状态名称
   */
  statusName: string;
  /**
   * 时间字符串
   */
  timeStr?: string;
}

export interface VisitorInviteRecordResult {
  /**
   * 访问日期
   */
  accessDate?: string;
  /**
   * 访问区域
   */
  areaId?: string;
  /**
   * 访问区域
   */
  areaName?: string;
  /**
   * 预约二维码
   */
  barCode?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 流程实例id
   */
  processInsId?: string;
  /**
   * 状态
   */
  status?: string;
  /**
   * 访问时段
   */
  timeStr?: string;
  /**
   * 访客身份证号
   */
  visitorIdCard?: string;
  /**
   * 访客姓名
   */
  visitorName?: string;
  /**
   * 访客电话
   */
  visitorPhone?: string;
}
