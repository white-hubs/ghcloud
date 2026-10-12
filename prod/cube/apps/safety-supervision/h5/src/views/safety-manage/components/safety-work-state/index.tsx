import { WorkSituation } from '@/components/work-situation'
import { defineComponent, watch, type PropType, reactive } from 'vue'
import { cubeSafetyManagementQuotaService } from '@/api/server'
import type { CalcData } from '@ghcloud/cube-safety-management-service'
import dayjs from 'dayjs'
import { showNotify } from 'vant'
import { storeMarket } from '@/store/market'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
const defaultSource = [
  {
    title: '报警任务响应率',
    imgSrc: 'alarm-task-res-ratio-icon',
    value: 0,
    unit: '%',
    total: 0,
    handleCount: 0,
    qoq: 0
  },
  {
    title: '隐患处理率',
    imgSrc: 'hidden-danger-hander-icon',
    value: 0,
    unit: '%',
    total: 0,
    handleCount: 0,
    qoq: 0
  },
  {
    title: '风险源建档率',
    imgSrc: 'risk-icon',
    value: 0,
    unit: '%',
    total: 0,
    handleCount: 0,
    qoq: 0
  },
  {
    title: '小散工程异常率',
    imgSrc: 'small-abnormal-ratio',
    value: 0,
    unit: '%',
    total: 0,
    handleCount: 0,
    qoq: 0
  },
  {
    title: '安全巡更频率',
    imgSrc: 'safe-patrol-ratio',
    value: 0,
    total: 0,
    handleCount: 0,
    unit: '次',
    qoq: 0
  },
  {
    title: '安全巡检频率',
    imgSrc: 'safe-patrol-ratio',
    value: 0,
    unit: '次',
    total: 0,
    handleCount: 0,
    qoq: 0
  },
  {
    title: '安全预案制度',
    imgSrc: 'safe-plan-icon',
    value: 0,
    unit: '个',
    total: 0,
    handleCount: 0,
    hideQaQ: true,
    qoq: 0
  },
  {
    title: '安全教育频率',
    imgSrc: 'safe-edu-ratio',
    value: 0,
    unit: '次',
    total: 0,
    handleCount: 0,
    qoq: 0
  },
]
export const SafetyWorkState = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const marketStore = storeMarket()
    const state = reactive<{ dataSource: CalcData[]; }>({
      dataSource: [...defaultSource]
    })
    const getData = async (): Promise<void> => {
      try {
        const metrics = [
          'safety_management-alarm-status_distribution', // 告警状态分布
          'safety_management-hidden_danger-status_distribution', // 隐患状态分布
          'safety_management-loose_work-status_distribution', // 小散统计分布
          'safety_management-patrol_task-status_distribution', // 巡更统计分布
          'safety_management-inspect_task-status_distribution', // 巡检状态分布
          'safety_management-emergency_file-count', // 预案文件数
          'safety_management-safety_education-count_frequency', // 安全教育已完成计数
          'safety_management-risk_source-archived_distribution', // 风险源建档情况分布
        ]
        const payload = {
          metrics,
          period: props.period,
          applicationCode: ApplicationCode.SAFETYMANAGEHEAD,
          marketTenantIDs: !marketStore.currentMarket ? [] : [marketStore.currentMarket]
        }
        const result = await cubeSafetyManagementQuotaService.batchGetSafetyWorkSituationQuotaService(payload)
        state.dataSource = result.map(item => {
          return {
            ...item,
            hideQaQ: item.title === '安全预案制度'
          }
        })
        emit('success')
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    watch(() => props.period, async () => {

      await getData()
    }, { deep: true, immediate: true })
    const handleClick = (item: {
      title: string;
      imgSrc: string;
      value: number;
      unit: string;
      qoq: number;
    }): void => {
      if (item.title === '安全预案制度') {
        const params = {
          marketTenant: marketStore.currentMarket,
          alarmTypeCode: ApplicationCode.GAS
        }
        cubeAppService.toSafetyPlanFilePage(JSON.stringify(params))
      }
    }
    expose({
      getData
    })
    return (): JSX.Element => (
      <WorkSituation onClickItem={handleClick} dataSource={state.dataSource} title='安全工作情况' />
    )
  }
})
