import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { type DeptDeviceTreeVo, DeviceStatus, type ItemDetailsVo, type MedicalIotRealTimeDataVO, type MedicalOverrunAlarmHistoryRecordVO, type MedicalRuleNotifyConfigVO, type MedicalRuleTriggerDetailVO, type NormDataVO, type PageResult, type RealTimeMonitorVO, type ResourceMachinesRecord, type RuleNormParam, type TimeUnit, type MedicalDeviceHistoryStatisticsVO, type ImportResult, type DevicePropStatus, type AllTenantPropertVO, type TestStandardVO, CompanyVO, StandardTree, DetectionReportVO, ReportRecord, DetectionReportCommandParam, StandardTreeVO } from './types'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'

const baseURL = `${BASE_API}/medical-cleanliness`

/** 洁净手术室服务 */
export class CubeOperatingRoomService {
  private readonly gateway: CubeGateway
  private readonly securityManagementService: CubeSecurityManagementService
  private readonly iotService: CubeDeviceCenterService
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
    this.securityManagementService = new CubeSecurityManagementService(auth)
    this.iotService = new CubeDeviceCenterService(auth)
  }

  /** 规则配置 分页 */
  public async getRulePage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string ;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/rule/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  public async getRuleAll (payload?: {
    deviceIds?: string;
    keyword?: string ;
  }): Promise<{ deviceIds: string; ruleNormList: RuleNormParam[];file: null | { id: string; path: string;type: string; }; areaOptions: string; }[]> {
    const url = `${baseURL}/rule/all`
    const resp = await this.gateway.get<LegacyServiceError<{ deviceIds: string; ruleNormList: RuleNormParam[];file: null | { id: string; path: string;type: string; }; areaOptions: string; }[]>>({ url, payload })
    return resp.data||resp
  }

  /** 规则配置 详情 */
  public async getRuleDetail (payload: {
    id: string;
  }): Promise<unknown> {
    const url = `${baseURL}/rule/queryById/${payload.id}`
    const resp = await this.gateway.get< LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 规则配置-更新 */
  public async updateRule (payload: {
    areaIds?: string;
    id?: number;
    name?: string | undefined;
    file?: string | number | null | undefined;
    ruleNormList?: RuleNormParam[];
  }): Promise<void> {
    const url = `${baseURL}/rule/update`
    await this.gateway.update({ url, payload })
  }

  /** 规则配置-新增 */
  public async addRule (payload: {
    areaIds?: string | undefined;
    file?: string | number | null | undefined;
    name?: string | undefined;
    ruleNormList?: RuleNormParam[];
  }): Promise<unknown> {
    const url = `${baseURL}/rule/insert`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 规则配置-删除 */
  public async delRule (id: string): Promise<void> {
    const url = `${baseURL}/rule/delete/${id}`
    await this.gateway.delete({ url })
  }

  /** 实时监测 分页 */
  public async getTimePage (payload: {
    pageSize: number;
    pageNumber: number;
    areaId?: string ;
    keyword?: string ;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; pages: number; }> {
    enum DevicePropStatus {
      NORMAL = 'NORMAL', // 正常
      LOWER_LIMIT = 'LOWER_LIMIT', // 低于下限
      UPPER_LIMIT = 'UPPER_LIMIT', // 超过上限
    }
    const res = await this.securityManagementService.getSecurityDevicePage({ ...payload, applicationCode: 'OPERATING_ROOM' })
    const records: RealTimeMonitorVO[] = res.records.map(e => {
      return {
        areaId: e.areaId.split('-').slice(-1)[0],
        details: [],
        id: e.deviceId,
        deviceInfo: e,
        operatingRoomName: e.deviceName,
        status: DeviceStatus.VALID,
        background: {
          url: '',
          type: 'image'
        }
      }
    })
    if (records.length === 0) {
      return {
        records: [],
        total: 0,
        pages: 0
      }
    }
    // 规则查询
    const rules = await this.getRuleAll({ deviceIds: records.map(e => e.id).join(',') || undefined })

    // 设备数据数据处理
    const promises = records.map(async (e, i) => {
      const { productPropVoList, snapshots } = await this.iotService.getNorthDeviceDetail({
        deviceId: e.id,
        withSnapShot: true,
        withPropertySpec: true,
      })
      records[i].details = productPropVoList.map(ele => {
        const details: NormDataVO = {
          normCode: ele.propCode ?? '',
          normName: ele.propName ?? '',
          unit: ele.unitName,
          value: undefined,
          status: DevicePropStatus.NORMAL,
          display: 1,
          showArea: '',
          sort: 1
        }
        // 设备属性匹配
        snapshots.forEach(item => {
          if (item.key === ele.propCode) {
            details.value = item.value ? Number(item.value) : undefined

            // 暂时用一个属性来表示是否有效
            if (item.key === 'effective') {
              records[i].status = item.value === '0' ? DeviceStatus.INVALID : DeviceStatus.VALID
            }
          }
        })
        return details
      })
    })

    await Promise.all(promises)
    // 监测规则匹配
    records.forEach(room => {
      const rule = rules.find(e => e.deviceIds.includes(`${room.id}`))
      if (rule) {
        room.details.forEach((detailItem) => {
          const propItem = rule.ruleNormList.find(e => detailItem.normCode === e.normCode)
          if (propItem) {
            if (propItem.display === 0) {
              detailItem.display = 0
            }
            detailItem.showArea = propItem.showArea
            detailItem.sort = propItem.sort
            if (propItem?.lowerLimit && propItem?.upperLimit && typeof detailItem.value !== 'undefined') {
              if (detailItem.value < propItem.lowerLimit) {
                detailItem.status = DevicePropStatus.LOWER_LIMIT
              } else if (detailItem.value > propItem.upperLimit) {
                detailItem.status = DevicePropStatus.UPPER_LIMIT
              }
            }
          }
        })
        room.background.type = rule.file?.type === 'mp4' ? 'video' : 'image'
        room.background.url = rule.file?.path ? rule.file.path : ''
      }
    })
    return {
      records,
      total: res.total,
      pages: res.pages
    }
  }

  /** 历史监测 分页 */
  public async getHistoryPage (payload: {
    pageSize: number;
    pageNumber: number;
    areaId?: string ;
    period?: string ;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; }> {
    const url = `${baseURL}/monitor/history/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: RealTimeMonitorVO[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 历史监测记录状态统计 分页 */
  public async getHistoryStatistics (payload: {
    pageSize: number;
    pageNumber: number;
    depIds?: string[];
    period?: string | undefined;
    deviceName?: string | undefined;
    status?: string | undefined;
  }): Promise<{ records: MedicalDeviceHistoryStatisticsVO[]; total: number; pages: number; }> {
    const url = `${baseURL}/medical/device/history/statistics`
    const resp = await this.gateway.get<{ records: MedicalDeviceHistoryStatisticsVO[]; total: number; pages: number; }>({ url, payload })
    return resp
  }

  /** 历史监测 导出 */
  public async exportHistory (payload: {
    pageSize: number;
    pageNumber: number;
    areaId?: string;
    period?: string;
  }): Promise<Blob> {
    const url = `${baseURL}/monitor/history/getExcel?pageSize=${payload.pageSize}&pageNumber=${payload.pageNumber}&areaId=${payload.areaId}&period=${payload.period}`
    return this.gateway.customBlob({ method: 'GET', url, payload })
  }

  /** 设备日报表 分页 */
  public async getMedicalDevicePage (payload: {
    pageSize: number;
    pageNumber: number;
    tenant?: string | undefined;
    period?: string | undefined ;
    deviceProdCategoryCode?: string | undefined;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; }> {
    const url = `${baseURL}/getMedicalDevicePage`
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<{ records: RealTimeMonitorVO[]; total: number; }>>({
      url,
      query: payload,
      method: 'GET',
      ...headers
    })
    return resp.data||resp
  }

  /** 报警日报表 分页 */
  public async getMedicalAlarmPage (payload: {
    pageSize: number;
    pageNumber: number;
    tenant?: string | undefined;
    period?: string | undefined;
    deviceProdCategoryCode?: string | undefined;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; }> {
    const url = `${baseURL}/getMedicalAlarmPage`
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<{ records: RealTimeMonitorVO[]; total: number; }>>({
      url,
      query: payload,
      method: 'GET',
      ...headers
    })
    return resp.data||resp
  }

  /** 实时监测 分页 */
  public async getRealTimeDataPage (payload: {
    depId?: number | string | undefined;
    pageNumber: number;
    pageSize: number;
    status?: string | undefined;
    tenant?: string | undefined;
    normType?: string | undefined;
    deviceIds?: string[] | undefined;
    deviceName?: string | undefined;
  }): Promise<{ records: MedicalIotRealTimeDataVO[]; total: number; pages: number; }> {
    const url = `${baseURL}/get/real/time/data/page`
    const resp = await this.gateway.custom<{ records: MedicalIotRealTimeDataVO[]; total: number; pages: number; }>({
      url,
      payload,
      method: 'POST',
    })
    return resp
  }

  /** 实时监测 详情 */
  public async getRealTimeDetail (payload: {
    id: string;
  }): Promise<MedicalIotRealTimeDataVO> {
    const url = `${baseURL}/get/real/time/data/details/${payload.id}`
    const resp = await this.gateway.get<MedicalIotRealTimeDataVO>({ url, payload })
    return resp
  }

  /** 设备历史监测记录 分页 */
  public async getMedicalOverrunAlarmPage (payload: {
    depId?: number | string | undefined;
    pageNumber: number;
    pageSize: number;
    status?: string | undefined;
    tenant?: string | undefined;
    period?: string | undefined;
    deviceIds?: string[] | undefined;
    deviceName?: string;
  }): Promise<{ records: MedicalOverrunAlarmHistoryRecordVO[]; total: number; pages: number; }> {
    const url = `${baseURL}/medical/overrun/alarm/page`
    const resp = await this.gateway.custom<{ records: MedicalOverrunAlarmHistoryRecordVO[]; total: number; pages: number; }>({
      url,
      payload,
      method: 'POST',
    })
    return resp
  }

  /** 实时监测分页，包含规则匹配  */
  public async getRealTimeByRule (payload: {
    depId?: number | string | undefined;
    pageNumber: number;
    pageSize: number;
    status?: string | undefined;
    tenant?: string | undefined;
    normType?: string | undefined;
    deviceIds?: string[] | undefined;
    deviceName?: string | undefined;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; pages: number; }> {
    const res = await this.getRealTimeDataPage({ ...payload })
    const list = await this.normRuleFit(res.records)
    if (list?.length === 0) {
      return {
        records: [],
        total: 0,
        pages: 0
      }
    }
    return {
      records: list,
      total: res.total,
      pages: res.pages
    }
  }

  /** 实时监测详情，包含规则匹配  */
  public async getRealDetailByRule (payload: {
    id: string;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; pages: number; }> {
    const res = await this.getRealTimeDetail({ ...payload })
    const list = await this.normRuleFit([res])
    if (list?.length === 0) {
      return {
        records: [],
        total: 0,
        pages: 0
      }
    }
    return {
      records: list,
      total: 0,
      pages: 0
    }
  }

  /** 历史监测分页，包含规则匹配  */
  public async getHistoryPageByRule (payload: {
    depId?: number | string | undefined;
    pageNumber: number;
    pageSize: number;
    status?: string | undefined;
    tenant?: string | undefined;
    period?: string | undefined;
    deviceIds?: string[] | undefined;
    deviceName?: string | undefined;
  }): Promise<{ records: RealTimeMonitorVO[]; total: number; pages: number; }> {
    const res = await this.getMedicalOverrunAlarmPage({ ...payload })
    const list = await this.normRuleFit(res.records as MedicalIotRealTimeDataVO[])
    if (list?.length === 0) {
      return {
        records: [],
        total: 0,
        pages: 0
      }
    }
    return {
      records: list,
      total: res.total,
      pages: res.pages
    }
  }

  /** 适配指标规则 (展示区域/排序) */
  public async normRuleFit (data: MedicalIotRealTimeDataVO[]): Promise<RealTimeMonitorVO[]> {
    const records: RealTimeMonitorVO[] = data.map(e => {
      const deviceInfos = e?.recordData ?? e?.data
      return {
        areaId: `${e.depId}`,
        depId: e.depId,
        depName: e.depName,
        deviceId: e.deviceId ?? '',
        id: e.id ?? '',
        operatingRoomName: e.deviceName,
        status: (e?.deviceStatus ?? e?.status) as DeviceStatus,
        tenantName: e.tenantName,
        deviceInfo: e,
        background: {
          url: '',
          type: 'image'
        },
        areaOptions: '',
        details: deviceInfos?.map(e => {
          const details: NormDataVO = {
            normCode: (e?.normCode ?? e?.ruleNormCode) ?? '',
            normName: e?.normName ?? e?.ruleNormName ?? '',
            unit: e.unit,
            value: Number(e.value ?? 0),
            status: e.status as DevicePropStatus,
            display: 1,
            showArea: '',
            sort: 1
          }
          return details
        }) ?? [],
      }
    })
    if (records.length === 0) return []
    // 规则查询
    const rules = await this.getRuleAll({ deviceIds: records.map(e => e.deviceId).join(',') || undefined })
    // 监测规则匹配
    records.forEach(room => {
      const rule = rules.find(e => e.deviceIds.includes(`${room.deviceId}`))
      if (rule) {
        room.details.forEach((detailItem) => {
          const propItem = rule.ruleNormList.find(e => detailItem.normCode === e.normCode)
          if (propItem) {
            if (propItem.display === 0) {
              detailItem.display = 0
            }
            detailItem.showArea = propItem.showArea
            detailItem.sort = propItem.sort
          }
        })
        room.background.type = rule.file?.type === 'mp4' ? 'video' : 'image'
        room.background.url = rule.file?.path ? rule.file.path : ''
        room.areaOptions = rule?.areaOptions || ''
      }
    })
    return records
  }

  /** 设备历史监测记录 删除 */
  public async deleteMedicalRecord (payload: {
    ids?: string[] | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/medical/deleteRecord`
    const resp = await this.gateway.custom<unknown>({
      url,
      payload,
      method: 'POST',
    })
    return resp
  }

  /** 超限提醒配置 保存 */
  public async saveNotifyConfig (payload: {
    notifyChannels?: string | undefined;
    times?: number | undefined;
    timeUnit?: TimeUnit | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/rule/notify/config`
    const resp = await this.gateway.create<unknown>({ url, payload })
    return resp
  }

  /** 超限提醒配置 详情 */
  public async getNotifyConfigDetail (): Promise<MedicalRuleNotifyConfigVO> {
    const url = `${baseURL}/rule/notify/config`
    const resp = await this.gateway.get<LegacyServiceError<MedicalRuleNotifyConfigVO>>({ url })
    return resp.data||resp
  }

  /** 超限提醒配置 详情 */
  public async getMedicalRuleTriggerDetail (id: string, messageId?: string): Promise<MedicalRuleTriggerDetailVO> {
    const url = `${baseURL}/medical-rule/trigger/${id}?messageId=${messageId}`
    const resp = await this.gateway.get<MedicalRuleTriggerDetailVO>({ url })
    return resp
  }

  /**
   * 获取部门和设备树
   */
  public async getResourceDeptDeviceTree (payload: {
    tenant: string;
  }): Promise<DeptDeviceTreeVo[]> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/medical/list/getDeptAndDeviceTree`
    const resp = await this.gateway.get<LegacyServiceError<DeptDeviceTreeVo[]>>({ url })
    return resp.data||resp
  }

  /**
   * 资源管理机组分页查询
   */
  public async getResourceMachinesPage (payload: {
    pageSize: number;
    pageNumber: number;
    tenant: string;
    code: string;
  }): Promise<PageResult<ResourceMachinesRecord>> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<ResourceMachinesRecord>>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 新增资源机组
   */
  public async createResourceMachines (payload: {
    code: string;
    arguments: string;
    fileIds: string;
    tenant: string;
  }): Promise<unknown> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/add`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 更新资源机组信息
   */
  public async updateResourceMachines (payload: {
    id: string;
    code: string;
    arguments: string;
    fileIds: string;
    tenant: string;
    roomIds?: string;
  }): Promise<unknown> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/edit`
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 删除资源机组
   */
  public async deleteResourceMachines (payload: {
    id: string;
  }): Promise<void> {
    const url = `${baseURL}/resources/machines/remove`
    await this.gateway.delete({ url, payload })
  }

  /**
   * 获取资源机组详情
   */
  public async getResourceMachinesDetail (payload: {
    id: string;
    tenant: string;
  }): Promise<ResourceMachinesRecord> {
    const url = `${baseURL}/resources/machines/detail`
    this.gateway.updateAuth({ tenant: payload.tenant })
    const resp = await this.gateway.get<LegacyServiceError<ResourceMachinesRecord>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 下载批量导入机组模板
   */
  public async downloadResourceMachinesTemplate (): Promise<Blob> {
    const url = `${baseURL}/resources/machines/template`
    return this.gateway.customBlob({ method: 'GET', url })
  }

  /**
   * 批量导入机组
   */
  public async importResourceMachines (payload: {
    tenant: string;
    file: FormData;
  }): Promise<ImportResult> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/import`
    const resp = await this.gateway.custom<LegacyServiceError<ImportResult>>({ url, payload: payload.file, method: 'POST' })
    return resp.data||resp
  }

  /**
   * 获取机组关联手术室列表
   */
  public async getResourceMachinesRoomList (payload: {
    pageSize: number;
    pageNumber: number;
    tenant: string;
    id: string;
  }): Promise<PageResult<unknown>> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/room/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 关联机组手术室
   */
  public async createResourceMachinesRoom (payload: {
    tenant: string;
    id: string;
    roomIds: string;
  }): Promise<unknown> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/room/edit`
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 移除机组手术室
   */
  public async deleteResourceMachinesRoom (payload: {
    tenant: string;
    id: string;
    roomIds: string;
  }): Promise<void> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/machines/room/remove`
    await this.gateway.delete({ url, payload })
  }

  /**
   * 获取资源物品列表
   */
  public async getResourceItemList (payload: {
    pageSize: number;
    pageNumber: number;
    tenant: string;
    deviceId: string;
  }): Promise<PageResult<unknown>> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/item/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 新增物品
   */
  public async createResourceItem (payload: {
    tenant: string;
    deviceId: string;
    deviceCode: string;
    deviceName: string;
    name: string;
    size: string;
    number: string;
    manufacturer: string;
    model: string;
  }): Promise<unknown> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/item/add`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 下载物品模板
   */
  public async downloadResourceItemTemplate (): Promise<Blob> {
    const url = `${baseURL}/resources/item/template`
    return this.gateway.customBlob({ method: 'GET', url })
  }

  /**
   * 物品导出
   */
  public async exportResourceItem (payload: {
    tenant: string;
    tenantName: string;
    deptId: string;
    id?: string;
  }): Promise<Blob> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/item/downloadItemDetail?tenant=${payload.tenant}&tenantName=${payload.tenantName}&deptId=${payload.deptId}`
    return this.gateway.customBlob({ method: 'GET', url, payload })
  }

  /**
   * 批量导入物品
   */
  public async importResourceItem (payload: {
    tenant: string;
    file: FormData;
  }): Promise<ImportResult> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/item/import`
    const resp = await this.gateway.custom<LegacyServiceError<ImportResult>>({ url, payload: payload.file, method: 'POST' })
    return resp.data||resp
  }
 
  /**
   * 编辑物品
   */
  public async updateResourceItem (payload: {
    tenant: string;
    deviceId: string;
    deviceCode: string;
    deviceName: string;
    id: string;
    name: string;
    size: string;
    number: string;
    manufacturer: string;
    model: string;
  }): Promise<unknown> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/item/edit`
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 删除物品
   */
  public async deleteResourceItem (payload: {
    id: string;
  }): Promise<void> {
    const url = `${baseURL}/resources/item/remove`
    await this.gateway.delete({ url, payload })
  }

  /**
   * 物品详情分页列表
   */
  public async getResourceItemDetailList (payload: {
    pageSize: number;
    pageNumber: number;
    deptId: string;
    tenant: string;
    id?: string;
  }): Promise<PageResult<ItemDetailsVo>> {
    this.gateway.updateAuth({ tenant: payload.tenant })
    const url = `${baseURL}/resources/item/detailPage`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<ItemDetailsVo>>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 获取所有租户的产品
   */
  public async getAllTenantProductList (): Promise<AllTenantPropertVO[]> {
    const url = `${baseURL}/product/all-tenant/products`
    const resp = await this.gateway.get<AllTenantPropertVO[]>({ url })
    return resp
  }

  /**
   * 检测依据分页
   */
  public async getTestStandardList (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
  }): Promise<PageResult<TestStandardVO>> {
    const url = `${baseURL}/detection/page`
    const resp = await this.gateway.get<PageResult<TestStandardVO>>({ url, payload })
    return resp
  } 

  /**
   * 检测依据详情
   */
  public async getTestStandardDetails (id: string): Promise<TestStandardVO> {
    const url = `${baseURL}/detection/${id}`
    const resp = await this.gateway.get<TestStandardVO>({ url })
    return resp
  }

  /**
   * 新增依据信息
   */
  public async addTestStandard (payload: {
    name: string;
    standards: {
      name: string;
      properties: {
        productId: string;
        productName: string;
        propertyName: string;
        propertyCode: string;
        propertyUnit: string;
        tenantId: string;
        maxVal: number;
        minVal: number;
      }[]
    }[]
  }): Promise<boolean> {
    const url = `${baseURL}/detection/basic`
    const resp = await this.gateway.create<boolean>({ url, payload })
    return resp
  }

  /**
   * 修改依据信息
   */
  public async updateTestStandard (payload: {
    id: string;
    name: string;
    standards: {
      id?: string;
      name: string;
      properties: {
        id?: string;
        productId: string;
        productName: string;
        propertyName: string;
        propertyCode: string;
        propertyUnit: string;
        tenantId: string;
        maxVal: number;
        minVal: number;
      }[]
    }[]
  }): Promise<boolean> {
    const url = `${baseURL}/detection/basic`
    const resp = await this.gateway.update<boolean>({ url, payload })
    return resp
  }

  /**
   * 删除依据信息
   */
  public async deleteTestStandard (id: string): Promise<void> {
    const url = `${baseURL}/detection/basic/${id}`
    const resp = await this.gateway.delete({ url })
    return resp
  }

  /** 受检公司 分页 */
  public async getCompanyPage (payload: {
    tenantId?: number | string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: CompanyVO[]; total: number; pages: number; }> {
    const url = `${baseURL}/company/page`
    const resp = await this.gateway.get<{ records: CompanyVO[]; total: number; pages: number; }>({ url, payload })
    return resp
  }

  /** 检测天数倒计时 */
  public async getCompanyCountdown (): Promise<number> {
    const url = `${baseURL}/company/countdown`
    const resp = await this.gateway.get<number>({ url })
    return resp
  }

  /**
   * 更新检测公司信息
   */
  public async updateCompany (payload: {
    id?: string | number;
    calibrationDayCount?: number;
    detectionAddress?: string;
    detectionCompany?: string;
    detectionPhone?: string;
    detectionStampFileId?: string | null;
    detectionStatement?: string;
    templateContent?: string;
    tenantId?: string | number;
  }): Promise<unknown> {
    const url = `${baseURL}/company/edit`
    const resp = await this.gateway.update<unknown>({ url, payload })
    return resp
  }

  /**
   * 删除检测公司
   */
  public async deleteCompany (payload: {
    tenantId: string | number
  }): Promise<void> {
    const url = `${baseURL}/company/remove`
    const resp = await this.gateway.delete({ url, payload })
    return resp
  }

  /** 检测公司 详情 */
  public async getCompanyDetail (tenant: string | number): Promise<CompanyVO> {
    const url = `${baseURL}/company/detail`
    const resp = await this.gateway.get<CompanyVO>({ url, payload: { tenant } })
    return resp
  }

  /** 报表的检测公司 */
  public async getReportCompanyDetail (reportId: string | number): Promise<CompanyVO> {
    const url = `${baseURL}/report/company`
    const resp = await this.gateway.get<CompanyVO>({ url, payload: { reportId } })
    return resp
  }

  /** 标准树形集合 */
  public async getDetectionStandardTree (payload?: {
    keyword?: string;
    productIdList?: string[];
  }): Promise<StandardTreeVO[]> {
    const url = `${baseURL}/detection/standard-tree`
    const resp = await this.gateway.custom<StandardTreeVO[]>({ url, payload, method: 'POST' })
    return resp
  }

  /** 下载报告检测数据源列表 */
  public async exportDetectionSourceList (payload: {
    recordId?:string | number;
  }): Promise<Blob> {
    const url = `${baseURL}/detection/download-excel-source-list/${payload.recordId}`
    const resp = await this.gateway.customBlob({
      url,
      method: 'GET',
      payload
    })
    return resp
  }
  /** 检测报告记录 分页 */
  public async getDetectionReportPage (payload: {
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: DetectionReportVO[]; total: number; pages: number; }> {
    const url = `${baseURL}/detection-report/page`
    const resp = await this.gateway.get<{ records: DetectionReportVO[]; total: number; pages: number; }>({ url, payload })
    return resp
  }
  /** 检测报告记录 分页 (admin端使用) */
  public async getDetectionReportAdminPage (payload: {
    pageNumber: number;
    pageSize: number;
    tenant?: string | undefined;
    period?: string | undefined;
  }): Promise<{ records: DetectionReportVO[]; total: number; pages: number; }> {
    const url = `${baseURL}/detection-report/admin/page`
    const resp = await this.gateway.get<{ records: DetectionReportVO[]; total: number; pages: number; }>({ url, payload })
    return resp
  }

  /** 生成报告数据 */
  public async generateDetectionReport (payload: DetectionReportCommandParam): Promise<ReportRecord> {
    const url = `${baseURL}/detection-report/generate`
    const resp = await this.gateway.custom<ReportRecord>({
      url,
      payload: payload as Record<string, unknown>,
      method: 'POST',
    })
    return resp
  }

  /** 报告详情 */
  public async getDetectionReportDetail (id: string | number): Promise<ReportRecord> {
    const url = `${baseURL}/detection-report/detail`
    const resp = await this.gateway.get<ReportRecord>({ url, payload: { id } })
    return resp
  }

  /** 报告详情 (admin端使用)  */
  public async getDetectionReportAdminDetail (id: string | number): Promise<ReportRecord> {
    const url = `${baseURL}/detection-report/admin/detail`
    const resp = await this.gateway.get<ReportRecord>({ url, payload: { id } })
    return resp
  }

}
