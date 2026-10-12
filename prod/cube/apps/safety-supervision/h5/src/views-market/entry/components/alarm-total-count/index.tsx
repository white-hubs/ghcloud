import { defineComponent, onMounted, ref, watch } from 'vue'
import styles from './index.module.less'
import { getAssetsFile, goAlarmRecords } from '@/utils'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import type { AlarmStatisticsVO } from '@ghcloud/cube-alarm-center-service/src/types/safety-analys'

export const AlarmTotalCount = defineComponent({
  props: {
    period: {
      type: String,
      default: ''
    },
    timeType: {
      type: String,
      default: ''
    }
  },
  emits: ['change', 'success'],
  setup (props, { emit, expose }) {
    const total = ref({
      count: 0,
      ratio: 0.0,
      unit: '个'
    })
    const getAlarmStatistics = async (): Promise<void> => {
      const prams = {
        period: props.period,
        type: props.timeType,
      }
      const res: AlarmStatisticsVO = await cubeAlarmSafetyAnalysisService.alarmStatistics(prams)
      total.value.count = res.alarmNum ?? 0
      total.value.ratio = res.alarmRingRatio ? Number(res.alarmRingRatio) : 0
    }
    const handleClickItem = (): void => {
      emit('change')
      goAlarmRecords({})
    }
    onMounted(() => {
      // getAlarmStatistics()
    })
    watch(() => props.period, () => {
      getAlarmStatistics()
    })

    expose({
      getData: () => {
        getAlarmStatistics()
      }
    })
    return (): JSX.Element =>
      <div class={styles.container} onClick={() => {
        handleClickItem()
      }}>
        <div class={styles.wrap}>
          <div class={styles.title}>
            <div class={styles.icon}><img class={styles.img} src={getAssetsFile('alarm-icon.png')} /></div>
            报警统计
          </div>
          <div class={styles.info}>
            <div class={styles.count}> <span>{total.value.count}</span> <span class={styles.unit}>{total.value.unit}</span> </div>
            <div class={styles.ratio}>
              环比 <span class={[styles.ratio_num, total.value.ratio > 0 && styles.ratio_up]}>{total.value.ratio > 0 ? `+${total.value.ratio}` : total.value.ratio}%</span>
              {total.value.ratio > 0 && <img src={getAssetsFile('ratio-up.png')} alt='' />}
              {
                total.value.ratio < 0 && <img src={getAssetsFile('ratio-down.png')} class={styles.img_down} alt='' />
              }
            </div>
          </div>
        </div>
      </div>
  }
})
