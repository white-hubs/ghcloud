import { defineComponent, ref, type PropType, watch } from 'vue'
import styles from './index.module.less'
import { Grid, GridItem, showNotify } from 'vant'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import dayjs from 'dayjs'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'

export const AlarmEventStat = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    },
    timeType: {
      type: String,
      default: ''
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const alarmStatData = ref([
      { title: '明火报警', value: 0, ratio: 0 },
      { title: '烟雾报警', value: 0, ratio: 0 },
      { title: '违规占用消防通道', value: 0, ratio: 0 },
      { title: '占道经营', value: 0, ratio: 0 },
      { title: '车辆违停', value: 0, ratio: 0 },
      { title: '现场交通拥堵', value: 0, ratio: 0 },
    ])
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisAlarmCorrectRatio({
          period: props.period.join(','),
          type: props.timeType,
          applicationCode: ApplicationCode.MONITORING
        })
        emit('success')
        if (res.length > 0) {
          alarmStatData.value = res.map((item) => {
            return {
              title: item.typeCode ?? '',
              value: item.alarmActualNum ?? 0,
              ratio: item.correctRate ?? 0
            }
          })
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    watch(() => props.period, async () => {
      await getData()
    }, { deep: true, immediate: true })
    expose({
      getData
    })
    return (): JSX.Element => (
      <div class={styles.container}>
        <Grid column-num={2}>
          {alarmStatData.value.map((item, index) => {
            return (
              <GridItem key={index}>
                <div class={styles.item}>
                  <div class={styles.title}>{item.title}</div>
                  <div class={styles.count}> <span>{item.ratio}</span> <span class={styles.unit}>%</span> </div>
                </div>
              </GridItem>
            )
          })}
        </Grid>
      </div>
    )
  }
})
