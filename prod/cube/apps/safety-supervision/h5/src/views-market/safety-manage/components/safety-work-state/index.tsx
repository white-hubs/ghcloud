import { WorkSituation } from '@/components/work-situation'
import { defineComponent, watch, type PropType, reactive } from 'vue'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import type { CalcData } from '@ghcloud/cube-safety-management-service'
import dayjs from 'dayjs'
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
    title: '安全巡检频率',
    imgSrc: 'risk-icon',
    value: 0,
    unit: '次',
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
    title: '小散工程异常率',
    imgSrc: 'small-abnormal-ratio',
    value: 0,
    unit: '%',
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
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
export const SafetyWorkState = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    },
    timeType: {
      type: String as PropType<SelectType>,
      default: 'THIS_MONTH'
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const state = reactive<{ dataSource: CalcData[]; }>({
      dataSource: [...defaultSource]
    })
    const getData = async (): Promise<void> => {
      try {
        const prams = {
          period: props.period.join(','),
          type: props.timeType,
          applicationCode: ApplicationCode.SAFETY
        }
        const res = await cubeAlarmSafetyAnalysisService.safetyWorkStatus(prams)
        emit('success')
        state.dataSource[0].value = res.alarmDispose?.ratio ?? 0
        state.dataSource[0].total = res.alarmDispose?.totalNum ?? 0
        state.dataSource[0].qoq = res.alarmDispose?.chainRatio ?? 0
        state.dataSource[1].value = res.hiddenDangerDispose?.ratio ?? 0
        state.dataSource[1].total = res.hiddenDangerDispose?.totalNum ?? 0
        state.dataSource[1].qoq = res.hiddenDangerDispose?.chainRatio ?? 0
        state.dataSource[2].value = res.inspectFrequency?.totalNum ?? 0
        state.dataSource[2].total = res.inspectFrequency?.totalNum ?? 0
        state.dataSource[2].qoq = res.inspectFrequency?.chainRatio ?? 0
        state.dataSource[3].value = res.patrolFrequency?.totalNum ?? 0
        state.dataSource[3].total = res.patrolFrequency?.totalNum ?? 0
        state.dataSource[3].qoq = res.patrolFrequency?.chainRatio ?? 0
        state.dataSource[4].value = res.projectError?.ratio ?? 0
        state.dataSource[4].total = res.projectError?.totalNum ?? 0
        state.dataSource[4].qoq = res.projectError?.chainRatio ?? 0
        state.dataSource[5].value = res.emergencyFile?.totalNum ?? 0
        state.dataSource[5].total = res.emergencyFile?.totalNum ?? 0
        state.dataSource[5].qoq = res.emergencyFile?.chainRatio ?? 0
        state.dataSource[6].value = res.educationFrequency?.totalNum ?? 0
        state.dataSource[6].total = res.educationFrequency?.totalNum ?? 0
        state.dataSource[6].qoq = res.educationFrequency?.chainRatio ?? 0
      } catch {
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
        cubeAppService.toEmergencyFilePage()
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
