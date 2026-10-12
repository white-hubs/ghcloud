import { type CubeAuth, CubeGateway, LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { AppointmentCountVo, AppointmentDetailState, AppointmentIdleVo, AppointmentIntervalLogVo, AppointmentUsageVo, AppointmentVo, BookRoomDetail, BookRoomVo, ConferenceDeviceAddOrUpdateParam, ConferenceGoods, ConferenceInfoVo, DisplayStatus, FieldConfigurationVO, MeetGoods, MeetRoomType, MeetType, MyAppointment, PageResult, ReservePageVO, RoomScreenConfigVO } from './types'

const baseURL = `${BASE_API}`

export class CubeMeetRoomService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // app预约分页
  public async getAppointment (payload: Record<string, string | boolean | number>): Promise<any> {
    const url = `${baseURL}/conference/app-appointment`
    const res = await this.gateway.get({ url, payload })
    return res
  }
  //app会议室预约列表
  public async getAppointmentInfo (payload: Record<string, string | boolean | number>): Promise<any> {
    const url = `${baseURL}/conference/book-room/appointmentInfo`
    const res = await this.gateway.get({ url, payload })
    return res
  }
  //预约统计
  public async getAppointmentStatistics (payload: Record<string, string | boolean | number>): Promise<any> {
    const url = `${baseURL}/conference/statistics/${payload.format}`
    const res = await this.gateway.get({ url, payload })
    return res
  }
  
  /** 预约记录 分页列表 */
  public async getReservePage (payload: {
    date?: string;
    keyword?: string;
    status?: string;
  }): Promise<PageResult<ReservePageVO>> {
    const url = `${baseURL}/conference/book-room/appointmentPage`
    const resp = await this.gateway.custom<LegacyServiceError<PageResult<ReservePageVO>>>({
      url,
      query: payload,
      method: 'GET',
    })
    return resp.data || resp
  }
  /** 我的预约 app */
  public async getMyAppointment (payload: {
    conferenceId?: number;
    date?: string;
    keyword?: string;
    pageNumber: number;
    pageSize: number;
    passTimes?: string[];
    status?: string;
  }): Promise<PageResult<MyAppointment>> {
    const url = `${baseURL}/conference/book-room/myappointment`
    const resp = await this.gateway.custom<LegacyServiceError<PageResult<MyAppointment>>>({
      url,
      query: payload,
      method: 'GET',
    })
    return resp.data || resp
  }
  /** 必输字段列表 */
  public async getRequiredFieldPage (payload: {
    fieldName?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: FieldConfigurationVO[]; total: number; }> {
    const url = `${baseURL}/conference/required/field/configuration`
    const resp = await this.gateway.get<LegacyServiceError<{ records: FieldConfigurationVO[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 必输字段新增或修改 */
  public async updateFieldConfig (payload: {
    createBy?: null | string;
    createTime?: null | string;
    deleted?: boolean | null;
    fieldCode?: null | string;
    fieldName?: null | string;
    id?: string | number | null;
    required?: boolean | null;
    tenant?: number | null;
    updateBy?: null | string;
    updateTime?: null | string;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/update/required/configuration`
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({ url, payload, method: 'POST' })
    return resp.data || resp
  }

  /** 获取会议类型 */
  public async getMeetTypeList (): Promise<MeetType[]> {
    const url = `${baseURL}/conference/conference-type-list`
    const resp = await this.gateway.get<LegacyServiceError<MeetType[]>>({ url })
    return resp.data || resp
  }

  /** 获取会议物品 */
  public async getMeetGoodsList (payload:{
    goodsName?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<MeetGoods[]> {
    const url = `${baseURL}/conference/conference-goods/list`
    const resp = await this.gateway.get<LegacyServiceError<MeetGoods[]>>({ url, payload })
    return resp.data || resp
  }
  /** 获取会议室详情 app */
  public async getAppAppointmentDetail (payload:{
     conferenceId?: string | number;
     date?: string;
     keyword?: string;
     pageNumber?: number;
     pageSize?: number;
     passTimes?: string[];
     status?: string;
  }): Promise<AppointmentDetailState> {
    const url = `${baseURL}/conference/app-appointment-detail`
    const resp = await this.gateway.get<LegacyServiceError<AppointmentDetailState>>({ url, payload })
    return resp.data || resp
  }
  /** 会议室预约 */
  public async reserveBookRoom (payload:{
    appointmentDate?: null | string;
    bookNum?: number | null;
    conferenceId?: string | number | null;
    conferenceTheme?: null | string;
    conferenceType?: null | string;
    content?: null | string;
    fieldConcatenation?: null | string;
    goodsIds?: null | string;
    goodsNames?: null | string;
    subscribePerson?: number | null;
    timeInterval?: null | string;
    participantType?: null | string;
    participantIds?: null | string[];
  }): Promise<unknown> {
    const url = `${baseURL}/conference/book-room`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  
  /** 取消会议室预约 */
  public async reserveBookRoomCancel (bookId: number, payload:{
    cancelReason?: string;
    isCancel: boolean;
  }): Promise<void> {
    const url = `${baseURL}/conference/book-room-cancel/${bookId}`
      await this.gateway.custom<LegacyServiceError<unknown>>({ method: 'DELETE', url, query:payload })
  }
  /** 会议室预约详情 */
  public async getBookRoomDetail (payload:{
    bookId?: string;
  }): Promise<BookRoomDetail> {
    const url = `${baseURL}/conference/bookroom/${payload.bookId}`
    const resp = await this.gateway.get<LegacyServiceError<BookRoomDetail>>({ url, payload })
    return resp.data || resp
  }
  
  /** 会议室分页查询 */
  public async getConferencePage (payload:{
    areaName?: string;
    name?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: ConferenceInfoVo[]; total: number; }> {
    const url = `${baseURL}/conference/getConferenceInfo`
    const resp = await this.gateway.get<LegacyServiceError<{ records: ConferenceInfoVo[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 会议室列表 */
  public async getConferenceList (payload: {
    keyword?: string;
  }): Promise<ConferenceInfoVo[]> {
    const url = `${baseURL}/conference/get-conference-list`
    const resp = await this.gateway.get<LegacyServiceError<ConferenceInfoVo[]>>({ url, payload })
    return resp.data || resp
  }
  /** 会议室详情 */
  public async getConferenceInfo (id: string): Promise<ConferenceInfoVo> {
    const url = `${BASE_API}/conference/getConferenceInfo/${id}`
    const resp = await this.gateway.get<LegacyServiceError<ConferenceInfoVo>>({ url })
    return resp.data || resp
  }

  /** 会议室-删除 */
  public async deleteConference (id: string): Promise<void> {
    const url = `${BASE_API}/conference/conference/${id}`
    await this.gateway.delete({ url })
  }
  /** 会议室 新增 */
  public async addConference (payload: {
    // 管理员(批量用","隔开)
    administrators?: null | string;
    areaId?: string | number | null;
    areaName?: null | string;
    capacity?: number | null;
    devices?: ConferenceDeviceAddOrUpdateParam[] | null;
    name?: null | string;
    period?: null | string;
    status?: number | null;
    conferenceRoomTypeId?: string | null;
    bookPersonType?: string | null;
    bookPerson?: string | null;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/insertConference`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 会议室 更新 */
  public async updateConference (payload: {
    administrators?: null | string;
    areaId?: string | number | null;
    areaName?: null | string;
    capacity?: number | null;
    devices?: ConferenceDeviceAddOrUpdateParam[] | null;
    id: string | number | null;
    name?: null | string;
    period?: null | string;
    status?: number | null;
    conferenceRoomTypeId?: string | null;
    bookPersonType?: string | null;
    bookPerson?: string | null;
  }): Promise<void> {
    const url = `${baseURL}/conference/updateConference`
    await this.gateway.update({ url, payload })
  }
  /** 会议室 更新状态 */
  public async updateConferenceStatus (id: string | number, status: number): Promise<void> {
    const url = `${baseURL}/conference/conference/${id}?status=${status}`
    await this.gateway.update({ url })
  }
  
  /** 会议物品查询（分页） */
  public async getMeetGoodsPage (payload:{
    goodsName?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: ConferenceGoods[]; total: number; }> {
    const url = `${baseURL}/conference/conference-goods/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: ConferenceGoods[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 会议物品 - 修改 */
  public async updateMeetGoods (id: string | number, payload: {
    areaId?: string | number | null;
    areaName?: null | string;
    goodsName?: null | string;
    illustrate?: null | string;
  }): Promise<void> {
    const url = `${baseURL}/conference/conference-goods/${id}`
    await this.gateway.update({ url, payload })
  }
  /** 会议物品 - 删除 */
  public async deleteMeetGoods (id: string): Promise<void> {
    const url = `${BASE_API}/conference/conference-goods/delete/${id}`
    await this.gateway.delete({ url })
  }
  
  /** 会议物品 - 批量删除 */
  public async batchDeleteMeetGoods (payload: {
    ids: string[];
  }): Promise<unknown> {
    const url = `${BASE_API}/conference/conference-goods/batch-delete`
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({ url, payload, method: 'POST' })
    return resp.data || resp
  }
  /** 会议物品 - 新增 */
  public async addMeetGoods (payload: {
    areaId?: string | number | null;
    areaName?: null | string;
    goodsName?: null | string;
    illustrate?: null | string;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/add-conference-goods`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  
  /** 会议类型（分页） */
  public async getMeetTypePage (payload:{
    keyword?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: MeetType[]; total: number; }> {
    const url = `${baseURL}/conference/conference-type-page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: MeetType[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 会议类型 - 新增 */
  public async addMeetType (payload: {
    name?: null | string;
    status?: null | boolean;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/add-conference-type`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 会议类型 - 删除 */
  public async deleteMeetType (id: string): Promise<void> {
    const url = `${BASE_API}/conference/delete-conference-type/${id}`
    await this.gateway.delete({ url })
  }
  /** 会议类型 - 修改 */
  public async updateMeetType (id: string | number, payload: {
    name?: null | string;
    status?: null | boolean;
  }): Promise<void> {
    const url = `${baseURL}/conference/update-conference-type/${id}`
    await this.gateway.update({ url, payload })
  }
  /** 会议室类型（分页） */
  public async getMeetRoomTypePage (payload:{
    keyword?: string;
    status?: boolean;
    name?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: MeetRoomType[]; total: number; }> {
    const url = `${baseURL}/conference/conference-room/type/conference-type-page`
    const resp = await this.gateway.get<{ records: MeetRoomType[]; total: number; }>({ url, payload })
    return resp
  }
  /** 会议室类型列表 */
  public async getMeetRoomTypeList (payload: {
    keyword?: string;
    status?: boolean;
    name?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<MeetRoomType[]> {
    const url = `${baseURL}/conference/conference-room/type/conference-type-list`
    const resp = await this.gateway.get<MeetRoomType[]>({ url, payload })
    return resp
  }
  /** 会议室类型 - 新增|修改 */
  public async saveMeetRoomType (payload: {
    name?: null | string;
    status?: null | boolean;
    id?: null | string | number;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/conference-room/type/save-or-update`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 会议室类型 - 删除 */
  public async deleteMeetRoomType (id: string): Promise<void> {
    const url = `${BASE_API}/conference/conference-room/type/${id}`
    await this.gateway.delete({ url })
  }
  /** 会议屏列表 */
  public async getRoomScreenConfigList (payload:{
    keyword?: string;
  }): Promise<RoomScreenConfigVO[]> {
    const url = `${baseURL}/conference/room/screen/config/list`
    const resp = await this.gateway.get<LegacyServiceError<RoomScreenConfigVO[]>>({ url, payload })
    return resp.data || resp
  }
  /** 会议屏 - 新增/修改 */
  public async saveRoomScreenConfig (payload: {
    authInfo?: null | string;
    conferenceId?: number | null;
    cronExpression?: number | null;
    deviceCode?: null | string;
    deviceName?: null | string;
    displayStatus?: DisplayStatus;
    id?: string | number | null;
    jobId?: number | null;
    programUrl?: null | string;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/room/screen/config/save`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 开启会议屏展示 */
  public async openRoomScreenConfig (payload: {
    authInfo?: null | string;
    conferenceId?: number | null;
    cronExpression?: number | null;
    deviceCode?: null | string;
    deviceName?: null | string;
    displayStatus?: DisplayStatus;
    id?: string | number | null;
    jobId?: number | null;
    programUrl?: null | string;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/room/screen/config/open`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 会议屏 - 删除 */
  public async deleteRoomScreenConfig (id: string): Promise<void> {
    const url = `${BASE_API}/conference/room/screen/config/delete/${id}`
    await this.gateway.delete({ url })
  }
  /** 预约记录 */
  public async getAppointmentPage (payload:{
    keyword?: string;
    pageNumber: number;
    pageSize: number;
    conferenceId?: number;
    date?: string;
    passTimes?: string[];
    status?: string;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/conference/book-room/appointmentPage`
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 预约记录导出 */
  public async exportAppointmentPage (payload:{
    conferenceId?: number;
    date?: string;
    keyword?: string;
    pageNumber: number;
    pageSize: number;
    passTimes?: string[];
    status?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/conference/book-room/appointment/export`
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 会议室预约 - 分页 */
  public async getConferenceAppointment(payload:{
    pageNumber: number;
    pageSize: number;
    conferenceId?: number;
    date?: string;
    keyword?: string;
    passTimes?: string[];
    status?: string;
  }): Promise<{ records: AppointmentVo[]; total: number; }> {
    const url = `${baseURL}/conference/appointment`
    const resp = await this.gateway.get<LegacyServiceError<{ records: AppointmentVo[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }
  /** 添加预约 */
  public async addBookRoom (payload: {
    appointmentDate?: null | string;
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
    participantType?: null | string;
    participantIds?: null | string[];
  }): Promise<unknown> {
    const url = `${baseURL}/conference/book-room`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 取消预约 */
  public async cancelBookRoom (bookId: string, payload: {
    cancelReason?: string;
    isCancel: boolean;
  }): Promise<void> {
    const url = `${BASE_API}/conference/book-room-cancel/${bookId}`
    await this.gateway.delete({ url, payload })
  }
  /** 预约详情 */
  public async getBookRoomInfo (bookId: string): Promise<BookRoomVo> {
    const url = `${BASE_API}/conference/bookroom/${bookId}`
    const resp = await this.gateway.get<LegacyServiceError<BookRoomVo>>({ url })
    return resp.data || resp
  }

  /** 会议室预约使用情况统计 */
  public async getConferenceUsage (payload: {
    TimeFlag?: string;
    period?: string;
  }): Promise<AppointmentUsageVo[]> {
    const url = `${BASE_API}/conference/getConferenceUsage`
    const resp = await this.gateway.get<LegacyServiceError<AppointmentUsageVo[]>>({
      url, payload
    })
    return resp.data || resp
  }

  /** 会议室预约使用总数统计 */
  public async getConferenceCount (payload: {
    TimeFlag?: string;
    period?: string;
  }): Promise<AppointmentCountVo> {
    const url = `${BASE_API}/conference/getConferenceCount`
    const resp = await this.gateway.get<LegacyServiceError<AppointmentCountVo>>({
      url, payload
    })
    return resp.data || resp
  }

  /** 会议室预约时段分析 */
  public async getTimeIntervalLog (payload: {
    TimeFlag?: string;
    period?: string;
  }): Promise<AppointmentIntervalLogVo[]> {
    const url = `${BASE_API}/conference/getTimeIntervalLog`
    const resp = await this.gateway.get<LegacyServiceError<AppointmentIntervalLogVo[]>>({
      url, payload
    })
    return resp.data || resp
  }

  /** 会议室预约闲置率统计 */
  public async getConferenceIdle (payload: {
    TimeFlag?: string;
    period?: string;
  }): Promise<AppointmentIdleVo[]> {
    const url = `${BASE_API}/conference/getConferenceIdle`
    const resp = await this.gateway.get<LegacyServiceError<AppointmentIdleVo[]>>({
      url, payload
    })
    return resp.data || resp
  }

}
