import { calcFontSize } from '@/utils/common'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import dayjs from 'dayjs'
import { defineComponent, onMounted, reactive } from 'vue'
import styles from './time-selector.module.less'

export const TimeSelector = defineComponent({
  name: 'TimeSelector',
  props: {
    value: {
      type: Object,
      default: ()=> {
        return {
          timeType: PeriodStatTypeEnum.THIS_WEEK,
          timeRange: [dayjs().startOf('week').format('YYYY-MM-DD HH:mm:ss'), dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss')]
        }
      }
    }
  },
  emits: ['timeChange', 'update:value'],
  setup (props, { emit }) {
    const state = reactive<{
      timeOptions: { label: string; value: PeriodStatTypeEnum; }[];
      timeValue: PeriodStatTypeEnum;
    }>({
      timeOptions: [
        { label: '按周', value: PeriodStatTypeEnum.THIS_WEEK },
        { label: '按月', value: PeriodStatTypeEnum.THIS_MONTH },
        { label: '按学期', value: PeriodStatTypeEnum.THIS_YEAR }
      ],
      timeValue: props.value.timeType
    })


    const handleTimeChange = (): void => {
      const dateRange = getTimeRangeInterval(state.timeValue)
      emit('update:value', {
        timeType: state.timeValue,
        dateRange: getTimeRangeInterval(state.timeValue)
      })
      emit('timeChange', {
        timeType: state.timeValue,
        dateRange
      })
    }

    /**
     * @description 时间转换助手方法
     * @param time 时间类型
     * @returns 时间区间
     */
    const getTimeRangeInterval = (time: PeriodStatTypeEnum): [string, string] => {
      let timeRange: dayjs.Dayjs[] = []
      switch (time){
        case PeriodStatTypeEnum.TODAY:
          timeRange = [dayjs().startOf('day'), dayjs().endOf('day')]
          break;
        case PeriodStatTypeEnum.THIS_WEEK:
          timeRange = [dayjs().startOf('week'), dayjs().endOf('week')]
          break;
        case PeriodStatTypeEnum.THIS_MONTH:
          timeRange = [dayjs().startOf('month'), dayjs().endOf('month')]
          break;
        case PeriodStatTypeEnum.THIS_YEAR:
          const startD = dayjs()
            .startOf("year")
          timeRange = [startD, startD.add(6, "month").subtract(1, "day")]
          break;
        case PeriodStatTypeEnum.THIS_QUARTER:
          timeRange = [dayjs().startOf('month'), dayjs().endOf('month')]
          break;
      }
      function formatDate (date: dayjs.Dayjs): string {
        return date.format('YYYY-MM-DD HH:mm:ss');
      }
      return [formatDate(timeRange[0]), formatDate(timeRange[1])]
    }
    onMounted(()=>{
      emit('update:value', {
        timeType: state.timeValue,
        dateRange: getTimeRangeInterval(state.timeValue)
      })
    })

    return (): JSX.Element => (
      <div class={styles["time-selector"]}>
        <a-select
          v-model:value={state.timeValue}
          onChange={handleTimeChange}
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: calcFontSize(12),
            outline: 'none'
          }}
        >
          {state.timeOptions.map(option => (
            <a-select-option key={option.value} value={option.value}>{option.label}</a-select-option>
          ))}
        </a-select>
      </div>
    )
  }
})