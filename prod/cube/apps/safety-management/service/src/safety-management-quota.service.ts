import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { QuotaResItem } from './type'
import { calculateQoqTime } from './utils'
const baseURL = `${BASE_API}/safety-management`
/**
 * 安全管理总部统计服务
 */
export interface CalcData {
  title: string;
  total: number;
  imgSrc: string;
  handleCount: number;
  value: number;
  unit: string;
  qoq: number;
}
export interface UseGasCalc {
  title: string;
  value: number;
  ratio: number | null;
  hideRatio?: boolean;
}
export enum ApplicationCode {
  /** 电气管理 */
  ELECTRICAL = 'ELECTRICMANAGE',
  /** 用气管理 */
  GAS = 'GAS_MANAGEMENT',
  /** 安防监控 */
  MONITORING = 'SECURITY_MONITORING',
  /** 消防管理 */
  FIRE = 'FIRECONTROL',
  SAFETYMANAGEHEAD = 'SAFETY_MANAGE_HEAD'
  /** 用气管理 */
}
/** 保留两位小数 */
const round = (num: number): number => {
  return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))
}
export class CubeSafetyManagementQuotaService {
  public quotaDataList: QuotaResItem[] = []
  public prevQuotaDataList: QuotaResItem[] = []
  public useGasQuotaDataList: QuotaResItem[] = []
  public prevUseGasQuotaDataList: QuotaResItem[] = []
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 安全工作情况指标
  public async batchGetSafetyWorkSituationQuotaService (payload: {
    metrics: string[];
    period: string[];
    applicationCode: ApplicationCode;
    marketTenantIDs: string[];
  }
  ): Promise<CalcData[]> {
    const url = `${baseURL}/metric/batch-get`
    const currentPayload = this.handlePayload(payload)
    const prevPayload = this.handlePayload({ ...payload, period: calculateQoqTime(payload.period) })
    // 当前周期
    const res = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload: currentPayload
    })
    const data = res as unknown as QuotaResItem[]
    this.quotaDataList = data
    // 获取上一个周期
    const prevRes = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload: prevPayload
    })
    this.prevQuotaDataList = prevRes as unknown as QuotaResItem[]
    // 报警任务数据
    const alarmQuotaData = this.calcAlarmQuotaData()
    // 隐患的数据
    const hiddenDangerData = this.calcHiddenDangerQuotaData()
    // 风险源建档率
    const riskSourceData = this.calcRiskSourceData()
    // 小散工程的数据
    const looseWorkData = this.calcLooseWorkData()
    // 安全巡更的数据
    const safePatrolData = this.calcSafePatrolData()
    // 安全巡检频率
    const safePatrolInspectionData = this.calcSafePatrolInspectionData()
    // 安全预案制度
    const safePlanData = this.calcSafePlanData()
    // 安全教育次数
    const safeEduData = this.calcSafeEduData()
    const result = [alarmQuotaData, hiddenDangerData, riskSourceData, looseWorkData, safePatrolData, safePatrolInspectionData, safePlanData, safeEduData]
    return result
  }

  // 用气安全统计指标
  public async batchGetGasSafetyQuotaService (payload: {
    metrics: string[];
    period: string[];
    applicationCode: ApplicationCode;
    marketTenantIDs: string[];
  }): Promise<UseGasCalc[]> {
    const url = `${baseURL}/metric/batch-get`
    const currentPayload = this.handlePayload(payload)
    // 上一个周期的时间
    const prevPayload = this.handlePayload({ ...payload, period: calculateQoqTime(payload.period) })
    // 当前周期
    const res = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload: currentPayload
    })
    // 上一个周期
    const prevRes = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload: prevPayload
    })
    this.useGasQuotaDataList = res as unknown as QuotaResItem[]
    this.prevUseGasQuotaDataList = prevRes as unknown as QuotaResItem[]
    // 电气报警数
    const alarmDatas = this.calcElectricAlarmQuotaData()
    // 易燃设备报警数
    return [...alarmDatas]
  }

  // 获取易燃设备建档数 累积
  public async getRiskArchives (payload: {
    applicationCode: ApplicationCode;
    marketTenantIDs: string[];
  }): Promise<{
      title: string;
      value: number;
    }> {
    const initValue = {
      title: '易燃设备建档数',
      value: 0,
    }
    const metrics = ['safety_management-risk_source-type_distribution']
    const url = `${baseURL}/metric/batch-get`
    const handlePayload = metrics.map(metric => {
      return {
        metric,
        payload: {
          applicationCodes: [payload.applicationCode],
          marketTenantIDs: payload.marketTenantIDs,
        }
      }
    })
    const res = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload: handlePayload
    }) as unknown as QuotaResItem[]
    if (res.length === 0) {
      return initValue
    }
    if (res[0].result === null) {
      return initValue
    }
    const total = (res[0].result as { groupKey: string;count: number; }[]).reduce((pre, cur) => {
      if (cur.groupKey === 'COMBUSTIBLE') {
        return pre + cur.count
      }
      return pre
    }, 0)
    initValue.value = total
    return initValue
  }

  // 计算电气报警数
  private calcElectricAlarmQuotaData (): UseGasCalc[] {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.useGasQuotaDataList, 'safety_management-alarm-status_distribution')
    // 上一个周期的报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevUseGasQuotaDataList, 'safety_management-alarm-status_distribution')

    // 计算总数
    const total = Object.values(quotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 计算上一个周期的总数
    const prevTotal = Object.values(prevQuotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    const electricalAlarmData = {
      title: '燃气报警数',
      status: '',
      value: total,
      ratio: this.calcQoq(total, prevTotal)
    }
    // 计算已处理报警数
    const handleCount = Object.keys(quotaData.result).reduce((pre, cur) => {
      if (cur === 'ALARM_HANDLER') {
        return pre + (quotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 计算上一个周期的已处理报警数
    const prevHandleCount = Object.keys(prevQuotaData.result).reduce((pre, cur) => {
      if (cur === 'ALARM_HANDLER') {
        return pre + (prevQuotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 整合已处理报警数数据
    const elecreicHandleAlarmData = {
      title: '已处理报警数',
      status: 'ALARM_HANDLER',
      value: handleCount,
      ratio: this.calcQoq(handleCount, prevHandleCount)
    }
    // 计算未处理报警数
    const unHandleCount = total - handleCount
    // 计算上一个周期的未处理报警数
    const prevUnHandleCount = prevTotal - prevHandleCount
    // 整合未处理报警数数据
    const elecreicUnHandleAlarmData = {
      title: '未处理报警数',
      status: 'ALARM_UN_CONFIRMED',
      value: unHandleCount,
      ratio: this.calcQoq(unHandleCount, prevUnHandleCount)
    }
    return [electricalAlarmData, elecreicUnHandleAlarmData, elecreicHandleAlarmData]
  }

  // 计算易燃设备建档数
  private calcUseGasCombustibleQuotaData (): UseGasCalc {
    // 当前风险源指标
    const quotaData = this.getDataByMetric(this.useGasQuotaDataList, 'safety_management-risk_source-type_distribution')
    // 上一个风险源指标
    const prevQuotaData = this.getDataByMetric(this.prevUseGasQuotaDataList, 'safety_management-risk_source-type_distribution')
    if (!quotaData.result) {
      return {
        title: '易燃设备建档数',
        value: 0,
        ratio: 0
      }
    }
    const total = (quotaData.result as { groupKey: string;count: number; }[]).reduce((pre, cur) => {
      if (cur.groupKey === 'COMBUSTIBLE') {
        return pre + cur.count
      }
      return pre
    }, 0)
    const prevTotal = (prevQuotaData.result as { groupKey: string;count: number; }[]).reduce((pre, cur) => {
      if (cur.groupKey === 'COMBUSTIBLE') {
        return pre + cur.count
      }
      return pre
    }, 0)
    return {
      title: '易燃设备建档数',
      value: total,
      ratio: this.calcQoq(total, prevTotal)
    }
  }

  // 处理参数
  private handlePayload (payload: {
    metrics: string[];
    period: string[];
    marketTenantIDs: string[];
    applicationCode?: ApplicationCode;
  }): Record<string, unknown>[] {
    const handlePayload = payload.metrics.map(item => {
      return {
        metric: item,
        payload: {
          applicationCodes: item === 'safety_management-alarm-status_distribution' && payload.applicationCode === ApplicationCode.SAFETYMANAGEHEAD ? [] : payload.applicationCode ? [payload.applicationCode] : [],
          createdPeriod: payload.period.join(','),
          marketTenantIDs: payload.marketTenantIDs,
        }
      }
    })
    return handlePayload
  }

  // 计算小散工程数据
  private calcLooseWorkData (): CalcData {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-loose_work-status_distribution')
    // 计算报警任务总数
    const total = Object.values(quotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 获取任务响应数
    const taskResponseNum = Object.keys(quotaData.result).reduce((pre, cur) => {
      if (cur === 'UNDERWAY') {
        return pre + (quotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 计算报警任务响应率
    const taskResponseRate = total !== 0 ? ((taskResponseNum / total) * 100) : taskResponseNum
    // 获取上一个报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-loose_work-status_distribution')
    // 上一个总数
    const prevTotal = Object.values(prevQuotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 上一个任务响应数
    const prevTaskResponseNum = Object.keys(prevQuotaData.result).reduce((pre, cur) => {
      if (cur === 'UNDERWAY') {
        return pre + (quotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 上一个周期
    const prevTaskResponseRate = prevTotal !== 0 ? ((prevTaskResponseNum / prevTotal) * 100) : prevTaskResponseNum
    return {
      title: '小散工程异常率',
      total,
      imgSrc: 'small-abnormal-ratio',
      handleCount: taskResponseNum,
      value: round(taskResponseRate),
      unit: '%',
      qoq: this.calcQoq(taskResponseRate, prevTaskResponseRate)
    }
  }

  // 计算安全巡更数据
  private calcSafePatrolData (): CalcData {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-patrol_task-status_distribution')

    // 计算报警任务总数
    const total = Object.values(quotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 巡更完成数
    const finishedCount = Object.keys(quotaData.result).reduce((pre, cur) => {
      if (cur === 'FINISHED') {
        return pre + (quotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 获取上一个报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-patrol_task-status_distribution')
    // 上一个周期巡更完成数
    const prevFinishedCount = Object.keys(prevQuotaData.result).reduce((pre, cur) => {
      if (cur === 'FINISHED') {
        return pre + (prevQuotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 上一个周期巡更完成率
    return {
      title: '安全巡更频率',
      total,
      imgSrc: 'safe-patrol-ratio',
      handleCount: finishedCount,
      value: finishedCount,
      unit: '次',
      qoq: this.calcQoq(finishedCount, prevFinishedCount)
    }
  }

  // 计算安全巡检数据
  private calcSafePatrolInspectionData (): CalcData {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-inspect_task-status_distribution')
    // 计算总数
    const total = Object.values(quotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 计算完成数
    const finishedCount = Object.keys(quotaData.result).reduce((pre, cur) => {
      return pre + (quotaData.result as Record<string, number>)[cur]
    }, 0)
    // 计算完成率
    // 获取上一个报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-inspect_task-status_distribution')
    // 上一个周期完成数
    const prevFinishedCount = Object.keys(prevQuotaData.result).reduce((pre, cur) => {
      return pre + (prevQuotaData.result as Record<string, number>)[cur]
    }, 0)
    // 上一个周期完成率
    return {
      title: '安全巡检频率',
      total,
      handleCount: finishedCount,
      imgSrc: 'safe-patrol-ratio',
      value: finishedCount,
      unit: '次',
      qoq: this.calcQoq(finishedCount, prevFinishedCount)
    }
  }

  // 计算安全教育次数
  private calcSafeEduData (): CalcData {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-safety_education-count_frequency')
    // 计算总数
    const total = (quotaData.result as number)
    // 获取上一个报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-safety_education-count_frequency')
    // 上一个周期总数
    const prevTotal = (prevQuotaData.result as number)
    return {
      title: '安全教育频率',
      total,
      handleCount: total,
      imgSrc: 'safe-edu-ratio',
      value: total,
      unit: '次',
      qoq: this.calcQoq(total, prevTotal)
    }
  }

  // 计算风险源数据
  private calcRiskSourceData (): CalcData {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-risk_source-archived_distribution')

    // 计算报警任务总数
    const total = (quotaData.result as Record<string, number>).total
    // 获取建档数
    const archivedNum = (quotaData.result as Record<string, number>).archived
    // 计算建档率
    const archivedRate = total !== 0 ? ((archivedNum / total) * 100) : archivedNum
    // 获取上一个报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-risk_source-archived_distribution')
    // 上一个周期总数
    const prevTotal = (prevQuotaData.result as Record<string, number>).total
    // 上一个周期建档数
    const prevArchivedNum = (prevQuotaData.result as Record<string, number>).archived
    // 上一个周期建档率
    const prevArchivedRate = prevTotal !== 0 ? ((prevArchivedNum / prevTotal) * 100) : prevArchivedNum
    return {
      title: '风险源建档率',
      total,
      imgSrc: 'risk-icon',
      handleCount: archivedNum,
      value: round(archivedRate),
      unit: '%',
      qoq: this.calcQoq(archivedRate, prevArchivedRate)
    }
  }

  // 计算报警指标数据
  private calcAlarmQuotaData (): CalcData {
    // 获取当前报警状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-alarm-status_distribution')
    // 计算报警任务总数
    const total = Object.values(quotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 获取任务响应数
    const taskResponseNum = Object.keys(quotaData.result).reduce((pre, cur) => {
      if (cur !== 'ALARM_UN_CONFIRMED') {
        return pre + (quotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 计算报警任务响应率
    const taskResponseRate = total !== 0 ? ((taskResponseNum / total) * 100) : taskResponseNum
    // 获取上一个报警状态分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-alarm-status_distribution')
    // 上一个总数
    const prevTotal = Object.values(prevQuotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 上一个任务响应数
    const prevTaskResponseNum = Object.keys(prevQuotaData.result).reduce((pre, cur) => {
      if (cur !== 'ALARM_UN_CONFIRMED') {
        return pre + (prevQuotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 上一个周期响应率
    const prevTaskResponseRate = prevTotal !== 0 ? ((prevTaskResponseNum / prevTotal) * 100) : prevTaskResponseNum
    return {
      title: '报警任务响应率',
      imgSrc: 'alarm-task-res-ratio-icon',
      total,
      handleCount: taskResponseNum,
      value: round(taskResponseRate),
      unit: '%',
      qoq: this.calcQoq(taskResponseRate, prevTaskResponseRate)
    }
  }

  // 计算安全预案制度
  private calcSafePlanData (): CalcData {
    // 获取当前预案
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-emergency_file-count')
    // 计算总数
    const total = (quotaData.result as number)
    // 获取上一个周期预案数据
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-emergency_file-count')
    // 上一个周期总数
    const prevTotal = (prevQuotaData.result as number)
    return {
      title: '安全预案制度',
      total,
      handleCount: total,
      imgSrc: 'safe-plan-icon',
      value: total,
      unit: '个',
      qoq: this.calcQoq(total, prevTotal)
    }
  }

  // 计算环比上涨还是下降
  private calcQoq (current: number, prev: number): number {
    if (prev === 0) {
      return 0
    }
    return (current - prev) / prev * 100
  }

  // 计算隐患处理率
  private calcHiddenDangerQuotaData (): CalcData {
    // 获取隐患状态分布
    const quotaData = this.getDataByMetric(this.quotaDataList, 'safety_management-hidden_danger-status_distribution')
    // 计算报警任务总数
    const total = Object.values(quotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)
    // 获取隐患处理数
    // const hiddenDangerHandleNum = (quotaData.result as Record<string, number>).WAITING_FOR_HANDLE + (quotaData.result as Record<string, number>).WAITING_CONFIRM
    const hiddenDangerHandleNum = Object.keys(quotaData.result).reduce((pre, cur) => {
      if (['FINISHED'].includes(cur)) {
        return pre + (quotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 计算隐患处理率
    const hiddenDangerHandleRate = total !== 0 ? ((hiddenDangerHandleNum / total) * 100) : hiddenDangerHandleNum
    // 获取上一个周期的隐患分布
    const prevQuotaData = this.getDataByMetric(this.prevQuotaDataList, 'safety_management-hidden_danger-status_distribution')
    // 上一个周期总数
    const prevTotal = Object.values(prevQuotaData.result as Record<string, number>).reduce((pre, cur) => {
      return pre + cur
    }, 0)

    // 上一个周期隐患处理数
    const prevHiddenDangerHandleNum = Object.keys(prevQuotaData.result).reduce((pre, cur) => {
      if (['FINISHED'].includes(cur)) {
        return pre + (prevQuotaData.result as Record<string, number>)[cur]
      }
      return pre
    }, 0)
    // 计算隐患处理率
    const prevHiddenDangerHandleRate = prevTotal !== 0 ? ((prevHiddenDangerHandleNum / prevTotal) * 100) : prevHiddenDangerHandleNum
    return {
      title: '隐患处理率',
      total,
      handleCount: hiddenDangerHandleNum,
      unit: '%',
      imgSrc: 'hidden-danger-hander-icon',
      value: round(hiddenDangerHandleRate),
      qoq: this.calcQoq(hiddenDangerHandleRate, prevHiddenDangerHandleRate)
    }
  }

  // 根据指标key获取指标数据
  private getDataByMetric (quotaDataList: QuotaResItem[], metric: string): QuotaResItem {
    const findItem = quotaDataList.find(item => item.metric === metric)
    if (!findItem) {
      throw new Error(`未找到对应指标metric:${metric}`)
    }
    return findItem
  }
}
