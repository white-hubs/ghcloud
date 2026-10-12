import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { BlackDetailVO, BlacklistRecord, DetailList, LampAreaDetail, LampRecord, PassRecord, ReservationDetail, ReservationRecord, VisitorInviteRecordResult } from './types'

const baseURL = `${BASE_API}/visitor-management`
interface TrendItemState {
  id?: string;
  reservationId?: string;
  phone: string;
  status: string;
  createTime?: string;
  hourStr: number;
  count: number;
}
export interface DayContrast {
  currentValue: string;
  compareValue: string;
  ratioValue: string;
}

export interface WeekContrast {
  currentValue: string;
  compareValue: string;
  ratioValue: string;
}

export interface DayAndWeekRatio {
  dayContrast: DayContrast;
  weekContrast: WeekContrast;
}
/** 访客管理服务 */
export class CubeVisitorManagementService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 通行记录 分页 */
  public async getPassRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
  }): Promise<{ records: PassRecord[]; total: number; }> {
    const url = `${baseURL}/visitor/reservation/passRecordPage`
    const resp = await this.gateway.get<LegacyServiceError<{ records: PassRecord[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 预约记录 分页 */
  public async getReservationRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
    statusList?: string;
    phone?: string;
  }): Promise<{ records: ReservationRecord[]; total: number; }> {
    const url = `${baseURL}/visitor/reservation/reservationRecordPage`
    const resp = await this.gateway.get<LegacyServiceError<{ records: ReservationRecord[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 邀约记录分页列表 分页 */
  public async getVisitorInviteRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
    statusList?: string;
    phone?: string;
  }): Promise<{ records: VisitorInviteRecordResult[]; total: number; }> {
    const url = `${baseURL}/visitor/invite/record/page`
    const resp = await this.gateway.get<{ records: VisitorInviteRecordResult[]; total: number; }>({ url, payload })
    return resp
  }

  /** 查看预约码 */
  public async getReservationCode (payload: {
    id: number;
  }): Promise<{ appointmentCode: string; }> {
    const url = `${baseURL}/visitor/reservation/getReservationCode`
    const resp = await this.gateway.get<LegacyServiceError<{ appointmentCode: string; }>>({ url, payload })
    return resp.data
  }

  /** 预约详情 */
  public async getReservationDetail (payload: {
    id: number;
  }): Promise<ReservationDetail> {
    const url = `${baseURL}/visitor/reservation/detail`
    const resp = await this.gateway.get<LegacyServiceError<ReservationDetail>>({ url, payload })
    return resp.data||resp
  }

  /** 访客邀请 - 预约详情 */
  public async getReservationDetailProcess (payload: {
    processInsId: string;
  }): Promise<ReservationDetail> {
    const url = `${baseURL}/visitor/reservation/detail/process`
    const resp = await this.gateway.get<LegacyServiceError<ReservationDetail>>({ url, payload })
    return resp.data||resp
  }

  /** 预约 */
  public async addReservation (payload: {
    areaId?: number;
    name?: string;
    period?: string;
    phone?: string;
  }): Promise<void> {
    const url = `${baseURL}/visitor/reservation/add`
    await this.gateway.update({ url, payload })
  }

  /** 黑名单 分页 */
  public async getBlacklistPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
  }): Promise<{ records: BlacklistRecord[]; total: number; }> {
    const url = `${baseURL}/visitor/blacklist/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: BlacklistRecord[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 黑名单 删除 */
  public async delBlacklist (id: number): Promise<void> {
    const url = `${baseURL}/visitor/blacklist/remove?id=${id}`
    await this.gateway.delete({ url })
  }

  /** 黑名单 新增 */
  public async addBlacklist (payload: {
    deviceCode?: string;
    phone: string;
  }): Promise<unknown> {
    const url = `${baseURL}/visitor/blacklist/add`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 黑名单 详情 */
  public async getBlackDetail (payload: {
    id?: number;
  }): Promise<BlackDetailVO> {
    const url = `${baseURL}/visitor/blacklist/detail`
    const resp = await this.gateway.get<LegacyServiceError<BlackDetailVO>>({ url, payload })
    return resp.data||resp
  }

  /** 区域 下拉 */
  public async getVisitorArea (payload?: {
    id?: number;
    keyword?: string;
  }): Promise<{ id: number;name: string; }[]> {
    const url = `${baseURL}/visitor/thirdArea/list`
    const resp = await this.gateway.get<LegacyServiceError<{ id: number;name: string; }[]>>({ url, payload })
    return resp.data||resp
  }

  /** 访问时段 分页 */
  public async getLampAreaPage (payload: {
    pageSize: number;
    pageNumber: number;
    id?: string;
    keyword?: string;
  }): Promise<{ records: LampRecord[]; total: number; }> {
    const url = `${baseURL}/visitor/area/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: LampRecord[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 访问区域 删除 */
  public async delLampArea (areaId: string): Promise<void> {
    const url = `${baseURL}/visitor/area/remove?areaId=${areaId}`
    await this.gateway.delete({ url })
  }

  /** 访问区域-新增 */
  public async addLampArea (payload: {
    areaId: string | string[];
    areaName?: string;
    visitDates?: string; // 日期段
    visitPeriods?: string; // 访问时段
    detailList?: DetailList[];
  }): Promise<unknown> {
    const url = `${baseURL}/visitor/area/add`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 访问区域-更新 */
  public async updateLampArea (payload: {
    areaId?: string | string[];
    areaName?: string;
    id?: number | string;
    visitDates?: string; // 日期段
    visitPeriods?: string; // 访问时段
    detailList?: DetailList[];
  }): Promise<unknown> {
    const url = `${baseURL}/visitor/area/edit`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 访问区域 详情 */
  public async getLampAreaDetail (payload: { areaId: string; }): Promise<LampAreaDetail> {
    const url = `${baseURL}/visitor/area/detail`
    const resp = await this.gateway.get<LegacyServiceError<LampAreaDetail>>({ url, payload })
    return resp.data||resp
  }

  /** 访问时段 详情 */
  public async getPeriodDetail (payload: {
    areaId: string;
    id?: string;
    period: string;
    areaName: string;
  }): Promise<LampAreaDetail> {
    const url = `${baseURL}/visitor/area/detail`
    const resp = await this.gateway.get<LegacyServiceError<LampAreaDetail>>({ url, payload })
    return resp.data||resp
  }

  /** 查询手机号是否预约 */
  public async getIsBooking (payload: {
    areaId: string | string[];
    period?: string;
    phone: number | string;
  }): Promise<LampAreaDetail> {
    const url = `${baseURL}/visitor/reservation/phoneIsReservation`
    const resp = await this.gateway.get<LegacyServiceError<LampAreaDetail>>({ url, payload })
    return resp.data||resp
  }

  /** 预约 新增 */
  public async reservationAdd (payload: {
    areaId: string | string[];
    areaName: string;
    period?: string;
    dayStr: string;
    name: string;
    phone: number | string;
    timeStr: string;
    nextDayBool?: number | boolean;
  }): Promise<{ id: string;appointmentCode: string; }> {
    const url = `${baseURL}/visitor/reservation/reservationAdd`
    const resp = await this.gateway.create<LegacyServiceError<{ id: string; appointmentCode: string; }>>({ url, payload })
    return resp.data||resp
  }

  /** 预约 新增 */
  public async reservationCancel (payload: {
    id: string;
  }): Promise<{ id: string; }> {
    const url = `${baseURL}/visitor/reservation/cancel`
    const resp = await this.gateway.create<LegacyServiceError<{ id: string; }>>({ url, payload })
    return resp.data||resp
  }

  /** 通讯趋势 */
  public async getVisitorPassTrend (payload: {
    period: string;
  }): Promise<TrendItemState[]> {
    const url = `${baseURL}/visitor/statusChange/passTrend`
    const resp = await this.gateway.get<LegacyServiceError<TrendItemState[]>>({ url, payload })
    return resp.data||resp
  }

  /** 预约记录环比（日+周） */
  public async dayAndWeekRatio (): Promise<DayAndWeekRatio> {
    const url = `${baseURL}/visitor/reservation/dayAndWeekRatio`
    const resp = await this.gateway.get<LegacyServiceError<DayAndWeekRatio>>({ url })
    return resp.data||resp
  }

  /** 访客邀请发起审批 */
  public async visitorApprovalSubmit (payload: {
    application?: null | string;
    applicationName?: null | string;
    approveUsers?: Record<string, unknown>;
    backLogTitle?: null | string;
    businessType?: null | string;
    businessTypeName?: null | string;
    data?: null | string;
    flowKey?: null | string;
    formDefinitionId?: string | number | null;
    formDefinitionVersion?: number | null;
    formKey?: null | string;
    formNo?: null | string;
    formNoPrefix?: null | string;
    id?: number | null;
    name?: null | string;
    type?: null | string;
    variable?: Record<string, unknown>;
    variables?: Record<string, unknown>;
  }): Promise<unknown> {
    const url = `${baseURL}/visitor/approval/submit`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }
}
