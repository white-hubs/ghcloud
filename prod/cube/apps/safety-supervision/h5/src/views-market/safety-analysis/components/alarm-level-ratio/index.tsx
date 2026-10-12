import { defineComponent, watch, type PropType, ref } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import Pie from '@/components/charts/pie/pie'
import PlanList from '@/components/charts/pie-list/pie-list'
import { Empty } from 'vant'
import { goAlarmRecords } from '@/utils'

type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
export const AlarmLevelRatio = defineComponent({
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
  setup: (props, { expose }) => {
    const colorList = ['#2989FF', '#00B358', '#FFAA00', '#1D66FF', '#FFC700', '#74AEE7', '#00F27B', '#29C2FF', '#2AE8BD', '#3590FF', '#19F8F7', '#EF424A', '#c4ceda', '#8c8f96']
    const eventProportionData = ref<{
      label: string;
      color: string;
      value: number;
      ratio: string;
    }[]>([])

    const getAlarmEventTypeRatio = async (): Promise<void> => {
      const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisAlarmLevelRatio({
        period: props.period.join(','),
      })
      eventProportionData.value = res.map((item, index) => {
        return {
          id: item.typeCode ?? '',
          label: item.typeName ?? '',
          color: colorList[index] ?? '',
          value: item.alarmNum ?? 0,
          ratio: item.ratio?.toString() ?? '0'
        }
      })
    }
    const alarmTypeDrilling = (id: string): void => {
      const params = {
        alarmLevelCode: id,
        startTime: props.period[0],
        endTime: props.period[1],
      }
      goAlarmRecords(params)
    }

    watch(() => props.period, () => {
      getAlarmEventTypeRatio()
    })
    expose({
      getData: () => {
        getAlarmEventTypeRatio()
      }
    })
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>报警级别占比</div>
        <div class={styles.alarmCountStat}>
          <div class='flex' v-show={eventProportionData.value.length}>
            <Pie pieData={eventProportionData.value} />
            <PlanList onChange={alarmTypeDrilling} roundPieData={eventProportionData.value} />
          </div>
          <Empty v-show={!eventProportionData.value.length} />
        </div>

      </div>
    )
  }
})
