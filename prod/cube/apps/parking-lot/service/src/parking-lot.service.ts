import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API, PageResultState } from '@ghcloud/cube-protocol'
import { BlacklistConfigVO, DevicePageInfoVO, GuideContentConfigParam, IllegalLevel, IllegalParkingBlacklistVO, IllegalParkingConfigVO, IllegalParkingRecordVO, MapObject, PageResult, ParkingAccessRecordsVO, ParkingAccessTotal, ParkingAccessTrend, ParkingInfoDetailVO, ParkingInfoVO, ParkingInfoVisualVO, ParkingLotVO, ParkingMonitorVO, StartUserInfo, StatisticalChartVO, VehicleGuideBoardConfigVO, VehicleInfoDetailVO, VehicleInfoVO, VehiclePenaltyRecordVO, VehicleTypeVO } from './type'

const baseURL = `${BASE_API}/park-management`

interface CarInfo {
  /**
     * 联系电话
     */
  customerMobile: string;
  /**
   * 车主
   */
  customerName: string;
  id: number;
  /**
   * 车牌号
   */
  vehicleNo: string;
  /**
   * 车辆类型
   */
  vehicleTypeCode: string;
  /**
   * 车辆类型名称
   */
  vehicleTypeName: string;
}
interface ParkingLotInfo {
  id: string;
  code: string;
  name: string;
}

/** 停车场管理服务 */
export class CubeParkingLotService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 车辆 分页 */
  public async getCarList (payload: {
    pageSize: number;
    pageNumber: number;
    vehicleNo?: string ;
  }): Promise<{ records: CarInfo[]; total: number; }> {
    const url = `${baseURL}/vehicle/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: CarInfo[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  /**
   * 停车场列表
   */
  public async getParkingLotListPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
  }): Promise<{ records: ParkingLotInfo[]; total: number; }> {
    const url = `${baseURL}/parking-infos-page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: ParkingLotInfo[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  /** 发起车辆审批 */
  public async vehicleApprovalSubmit (payload: {
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
    const url = `${baseURL}/vehicle/approval/submit`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 获取用户车牌车牌号**/
  public async getVehicleNumber (id: string): Promise<string[]> {
    const url = `${baseURL}/vehicle/approval/vechicle/no?id=${id}`
    const resp = await this.gateway.get<LegacyServiceError<string[]>>({ url })
    return resp.data || resp
  }

  /** 获取用户车牌车牌号时间**/
  public async getVehicleNumberTime (vechicleNo: string): Promise<{begin:string,end:string}> {
    const url = `${baseURL}/vehicle/approval/vechicle/start-end-time?vechicleNo=${vechicleNo}`
    const resp = await this.gateway.get<LegacyServiceError<{begin:string,end:string}>>({ url })
    return resp.data || resp
  }

  /** 获取车位信息 */
  public async getParkingInfo (payload: {
    keyword?: string;
    parkingInfoCode?: string;
    parkingInfoCodes?: string[];
    areaId?: string;
    source?: string;
  }): Promise<ParkingLotVO> {
    const url = `${baseURL}/parking-info`
    const resp = await this.gateway.get<LegacyServiceError<ParkingLotVO>>({ url, payload })
    return resp.data || resp
  }

  /** 获取车位信息 */
  public async getParkingDetail (id: string | number): Promise<ParkingInfoDetailVO> {
    const url = `${baseURL}/parking-infos/${id}`
    const resp = await this.gateway.get<LegacyServiceError<ParkingInfoDetailVO>>({ url })
    return resp.data || resp
  }

  /** 获取车场信息列表 */
  public async getParkingLotList (payload: {
    keyword?: string;
    parkingInfoCode?: string;
    parkingInfoCodes?: string[];
    areaId?: string;
    source?: string;
  }): Promise<ParkingInfoVO[]> {
    const url = `${baseURL}/parking-infos`
    const resp = await this.gateway.get<LegacyServiceError<ParkingInfoVO[]>>({ url, payload })
    return resp.data || resp
  }

  /** 获取车场监控信息列表 */
  public async getParkingMonitorDevices (): Promise<ParkingMonitorVO[]> {
    const url = `${baseURL}/parking/monitor-devices`
    const resp = await this.gateway.get<LegacyServiceError<ParkingMonitorVO[]>>({ url })
    return resp.data || resp
  }

  /** 获取车场设备配置列表 */
  public async getParkingDevicesById (id: string | number, payload: {
    anyAreaId?: number;
    anyMatchedAreaId?: string;
    anyMatchedDepartmentId?: number;
    categoryCode?: string;
    deviceState?: boolean;
    filterAreaIds?: string[];
    keyword?: string;
    matchedDeviceIds?: string[];
    pageNumber: number;
    pageSize: number;
    productId?: number;
  }): Promise<PageResultState<DevicePageInfoVO>> {
    const url = `${baseURL}/parking-infos/${id}/devices/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResultState<DevicePageInfoVO>>>({ url, payload })
    return resp.data || resp
  }

  /** 获取车场视角配置信息 */
  public async getParkingViewConfig (id: string | number): Promise<ParkingInfoVisualVO> {
    const url = `${baseURL}/parking-infos/${id}/view-config`
    const resp = await this.gateway.get<LegacyServiceError<ParkingInfoVisualVO>>({ url })
    return resp.data || resp
  }

  /** 车辆出入数量统计 */
  public async getParkingAccessTotal (payload?: {
    areaId?: string;
    parkingInfoCode?: string;
    period?: string;
    type?: string;
  }): Promise<ParkingAccessTotal> {
    const url = `${baseURL}/parking-access-record/access-total`
    const resp = await this.gateway.get<LegacyServiceError<ParkingAccessTotal>>({ url, payload })
    return resp.data || resp
  }

  /** 停车出入趋势 */
  public async getParkingAccessTrend (payload?: {
    areaId?: string;
    parkingInfoCode?: string;
    period?: string;
    type?: string;
  }): Promise<ParkingAccessTrend> {
    const url = `${baseURL}/parking-access-record/access-trend`
    const resp = await this.gateway.get<LegacyServiceError<ParkingAccessTrend>>({ url, payload })
    return resp.data || resp
  }

  /** 滞留车流分布 */
  public async getRetentionTrafficTrend (): Promise<StatisticalChartVO> {
    const url = `${baseURL}/parking/getRetentionTrafficTrend`
    const resp = await this.gateway.get<LegacyServiceError<StatisticalChartVO>>({ url })
    return resp.data || resp
  }

  /** 黑名单列表 */
  public async getParkingBlackList (payload?: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    period?: string;
    type?: string;
  }): Promise<PageResult<IllegalParkingBlacklistVO>> {
    const url = `${baseURL}/illegal/parking/blacklist/list`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<IllegalParkingBlacklistVO>>>({ url, payload })
    return resp.data || resp
  }

  /** 黑名单违停明细 */
  public async getParkingBlackDetail (payload?: {
    pageNumber: number;
    pageSize: number;
    plateNumber?: string;
    period?: string;
    violationTime?: string;
    type?: string;
  }): Promise<PageResult<VehiclePenaltyRecordVO>> {
    const url = `${baseURL}/illegal/parking/blacklist/detail`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<VehiclePenaltyRecordVO>>>({ url, payload })
    return resp.data || resp
  }

  /** 添加黑名单 */
  public async createParkingBlack (payload?: {
    owner?: string;
    phone?: string;
    plateNumber?: string;
    plateColor?: string;
    reason?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/illegal/parking/blacklist/create`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 移除黑名单 */
  public async deleteParkingBlack (id: string): Promise<void> {
    const url = `${baseURL}/illegal/parking/blacklist/remove/${id}`
    await this.gateway.delete({ url })
  }

  /** 获取黑名单阈值配置 */
  public async getBlackConfig (): Promise<BlacklistConfigVO> {
    const url = `${baseURL}/blacklist/config/get`
    const resp = await this.gateway.create<LegacyServiceError<BlacklistConfigVO>>({ url })
    return resp.data || resp
  }

  /** 新增或更新黑名单阈值配置 */
  public async saveBlackConfig (payload: {
    comparisonCondition?: string;
    thresholdValue?: number | undefined;
    id?: number | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/blacklist/config/save-or-update`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 移除黑名单阈值配置 */
  public async deleteBlackConfig (id: string): Promise<void> {
    const url = `${baseURL}/blacklist/config/${id}`
    await this.gateway.delete({ url })
  }

  /** 车辆违停工单列表 */
  public async getIllegalParkingList (payload?: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    completionTime?: string;
    submitTime?: string;
    period?: string;
    type?: string;
    applicationCode?: string;
    businessType: string;
    currentTaskName?: string;
    processInstanceIds?: string;
    processInstanceIdsList?: string[];
    startUserId?: number;
    status?: string;
    username?: string;
  }): Promise<PageResult<IllegalParkingRecordVO>> {
    const url = `${baseURL}/illegal/parking/list`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<IllegalParkingRecordVO>>>({ url, payload })
    return resp.data || resp
  }

  /** 新增车辆违停工单 */
  public async addIllegalParking (payload: {
    application?: string;
    applicationName?: string;
    approveUsers?: string | Record<string, unknown>;
    backLogTitle?: string;
    businessType?: string;
    businessTypeName?: string;
    data?: string;
    flowKey?: string;
    formDefinitionId?: number | string | undefined;
    formDefinitionVersion?: number;
    formKey?: string;
    formNo?: string;
    formNoPrefix?: string;
    id?: number;
    name?: string;
    phone?: string;
    publicForm?: boolean;
    startUserInfo?: StartUserInfo;
    type?: string;
    variable?: { [key: string]: any };
    variables?: MapObject;
  }): Promise<unknown> {
    const url = `${baseURL}/illegal/parking/submit`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 获取车辆违停扣分配置 */
  public async getIllegalParkingConfig (): Promise<IllegalParkingConfigVO[]> {
    const url = `${baseURL}/illegal/parking/config/get/config`
    const resp = await this.gateway.get<LegacyServiceError<IllegalParkingConfigVO[]>>({ url })
    return resp.data || resp
  }

  /** 新增或更新车辆违停扣分配置 */
  public async saveIllegalParkingConfig (payload: {
    id?: number | undefined;
    illegalLevel?: string | undefined;
    score?: number | undefined;
    timeCycle?: string | number | undefined;
  }[]): Promise<unknown> {
    const url = `${baseURL}/illegal/parking/config/save-or-update`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 移除车辆违停扣分配置 */
  public async deleteIllegalParkingConfig (id: string): Promise<void> {
    const url = `${baseURL}/illegal/parking/config/${id}`
    await this.gateway.delete({ url })
  }

  /** 车辆管理分页列表 */
  public async getVehiclePageList (payload?: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    isBlacklist?: string;
    vehicleNo?: string;
    vehicleTypeCode?: string;
    vehicleTypeName?: string;
    customerName?: string;
    customerMobile?: string;
    idList?: string[];
  }): Promise<PageResult<VehicleInfoVO>> {
    const url = `${baseURL}/vehicle/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<VehicleInfoVO>>>({ url, payload })
    return resp.data || resp
  }

  /** 车辆详情 */
  public async getVehicleDetail (id: string): Promise<VehicleInfoDetailVO> {
    const url = `${baseURL}/vehicle/${id}`
    const resp = await this.gateway.get<LegacyServiceError<VehicleInfoDetailVO>>({ url })
    return resp.data || resp
  }
  /** 车辆详情根据车牌进行查询 */
  public async getPlateNumberDetail(payload?: {
    vehicleNo: string;
  }): Promise<VehicleInfoDetailVO> {
    const url = `${baseURL}/vehicle/code`
    const resp = await this.gateway.get<LegacyServiceError<VehicleInfoDetailVO>>({ url, payload })
    return resp.data || resp
  }

  /** 保存车辆信息 */
  public async saveVehicleInfo (payload?: {
    createBy?: string;
    createTime?: string;
    customerMobile?: string;
    customerName?: string;
    deleted?: boolean;
    fileIdList?: number[];
    id?: number | string;
    isBlacklist?: boolean;
    tenant?: number;
    updateBy?: string;
    updateTime?: string;
    vehicleNo?: string;
    vehicleNoColor?: string;
    vehicleTypeCode?: string;
    vehicleTypeName?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/vehicle/saveOrUpdate`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 移除车辆 */
  public async deleteVehicle (id: string): Promise<void> {
    const url = `${baseURL}/vehicle/${id}`
    await this.gateway.delete({ url })
  }

  /** 车辆类型分页列表 */
  public async getVehicleTypePageList (payload?: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
  }): Promise<PageResult<VehicleTypeVO>> {
    const url = `${baseURL}/vehicle/type/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<VehicleTypeVO>>>({ url, payload })
    return resp.data || resp
  }
  /** 车辆类型全部列表 */
  public async getVehicleTypeList (payload?: {
    keyword?: string;
  }): Promise<VehicleTypeVO[]> {
    const url = `${baseURL}/vehicle/type/list`
    const resp = await this.gateway.get<LegacyServiceError<VehicleTypeVO[]>>({ url, payload })
    return resp.data || resp
  }

  /** 保存车辆类型 */
  public async saveVehicleType (payload?: {
    id?: string;
    name?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/vehicle/type/save-or-update`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 移除车辆类型 */
  public async deleteVehicleType (id: string): Promise<void> {
    const url = `${baseURL}/vehicle/type/${id}`
    await this.gateway.delete({ url })
  }

  /** 车辆引导牌配置分页列表 */
  public async getVehicleGuidePageList (payload?: {
    pageNumber: number;
    pageSize: number;
    name?: string;
  }): Promise<PageResult<VehicleGuideBoardConfigVO>> {
    const url = `${baseURL}/guidance/vehicle-guide-board-config/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<VehicleGuideBoardConfigVO>>>({ url, payload })
    return resp.data || resp
  }
  /** 车辆引导牌配置详情 */
  public async getGuideSignDetail (id: string): Promise<VehicleGuideBoardConfigVO> {
    const url = `${baseURL}/guidance/vehicle-guide-board-config/${id}`
    const resp = await this.gateway.get<LegacyServiceError<VehicleGuideBoardConfigVO>>({ url })
    return resp.data || resp
  }

  /** 新增车辆引导牌配置 */
  public async createGuideSign (payload?: {
    code?: string;
    contentConfigs?: GuideContentConfigParam[];
    id?: number | string | undefined;
    installationLocation?: string;
    name?: string;
    parkingLotId?: number | string | undefined;
    remark?: string;
    sceneImageIds?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/guidance/vehicle-guide-board-config/save`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 更新车辆引导牌配置 */
  public async updateGuideSign (payload?: {
    code?: string;
    contentConfigs?: GuideContentConfigParam[];
    id?: number | string | undefined;
    installationLocation?: string;
    name?: string;
    parkingLotId?: number | string | undefined;
    remark?: string;
    sceneImageIds?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/guidance/vehicle-guide-board-config/update`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }

  /** 移除车辆引导牌配置 */
  public async deleteGuideSign (id: string): Promise<void> {
    const url = `${baseURL}/guidance/vehicle-guide-board-config/${id}`
    await this.gateway.delete({ url })
  }

  /** 出入记录分页列表 */
  public async getParkingAccessRecords (payload?: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    period?: string;
    accessType?: string;
  }): Promise<PageResult<ParkingAccessRecordsVO>> {
    const url = `${baseURL}/parking-access-records`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<ParkingAccessRecordsVO>>>({ url, payload })
    return resp.data || resp
  }
}
