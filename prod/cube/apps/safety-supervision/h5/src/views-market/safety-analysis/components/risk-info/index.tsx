import { defineComponent, onMounted, ref, watch, type PropType } from 'vue'
import styles from './index.module.less'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { DashChart } from '@/components/charts/dash-chart/dash-chart'
import dayjs from 'dayjs'
import { Icon } from 'vant'
import { useRouter } from 'vue-router'

/** 安全分析 风险指数 */

type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
export const RiskInfo = defineComponent({
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
  setup (props, { emit, expose }) {
    const router = useRouter()
    const dataInfo = ref()
    const riskScore = ref(0)
    const loading = ref(false)
    const riskState = ref<string[]>([])
    const dashColor = ref<string>('')
    const dashRef = ref<{ setOptions: () => void; }>()

    const getRiskIndexDetail = async (): Promise<void> => {
      try {
        // 获取上一周的时间范围
        const lastWeekStartDate = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD HH:mm:ss')
        const lastWeekEndDate = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD HH:mm:ss')
        const params = {
          period: [lastWeekStartDate, lastWeekEndDate].join(','),
        }
        loading.value = true
        const data = await cubeAlarmSafetyAnalysisService.getRiskIndexDetail(params)
        emit('success')
        dataInfo.value = data
        riskScore.value = dataInfo.value?.riskIndex !== null ? 100 - Number(dataInfo.value?.riskIndex) : 0
        convertScore()
      } catch {
      } finally {
        loading.value = false
      }
    }
    const convertScore = (): void => {
      const score: number = riskScore.value
      if (score >= 0 && score <= 60) {
        riskState.value = ['高风险', 'high']
        dashColor.value = '#E94D15'
      } else if (score > 60 && score <= 80) {
        riskState.value = ['中等风险', 'middle']
        dashColor.value = '#ECA914'
      } else if (score > 80 && score <= 100) {
        riskState.value = ['运行良好', 'low']
        dashColor.value = '#3FDC97'
      } else {
        riskState.value = ['未知', 'unknown']
        dashColor.value = ''
      }
    }
    onMounted(() => {
      convertScore()
    })
    watch(() => props.period, () => {
      getRiskIndexDetail()
    })

    expose({
      getData: () => {
        getRiskIndexDetail()
      }
    })

    return (): JSX.Element =>

      <div class={styles.container}>
        <div class={styles.title} onClick={() => {
          router.push({ path: '/risk-tip' })
        }}>
          <div>
            风险指数
            <Icon name='question-o' class={styles.icon} />
          </div>
          <span class={styles.tipspan}>默认上周数据</span>
        </div>
        <div
          class={[styles.info, styles[riskState.value[1]]]}
          onClick={() => {
            const tenant = ''
            router.push({ path: '/market-risk-detail', query: { period: props.period.join(','), marketTenant: tenant } })
          }}
        >
          <div class={styles.info_left}>
            <div class={styles.score}>
              <div class={styles.score_num}>{riskScore.value}</div>
              <div class={styles.score_unit}>分</div>
            </div>
            <div class={styles.score_txt}>
              <p>安全标杆!</p>
              <p>继续保持哦!</p>
            </div>
          </div>
          <div class={styles.info_right}>
            <DashChart ref={dashRef} data={riskScore.value} pointerColor={dashColor.value} />
          </div>
        </div>
      </div>
  }
})
