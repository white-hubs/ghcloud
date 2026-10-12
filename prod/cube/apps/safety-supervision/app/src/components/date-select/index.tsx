import { defineComponent, ref } from 'vue'
import styles from './index.module.less'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Select } from '@ghcloud/cube-ui'
import { RangePicker } from 'ant-design-vue/es'

type DateRange = [Dayjs, Dayjs] | [string, string]
type DateStringRange = [string, string]

export const DateSelect = defineComponent({
  props: {
    onChange: {
      type: Function,
      default: undefined
    }
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    // 获取本月的开始和结束日期
    const getMonthRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().startOf('month')
      const end = dayjs().endOf('month')
      return [start, end]
    }

    // 获取上月的开始和结束日期
    const getLastMonthRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().subtract(1, 'month').startOf('month')
      const end = dayjs().subtract(1, 'month').endOf('month')
      return [start, end]
    }

    // 日期范围值
    const dateRange = ref<DateRange>(getMonthRange())
    // 左侧选择器的值
    const selectValue = ref<string | null>('MONTH')


    // 获取本季度的开始和结束日期
    const getQuarterRange = (): [Dayjs, Dayjs] => {
      const now = dayjs()
      const currentMonth = now.month()
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3
      const quarterEndMonth = quarterStartMonth + 2
      const start = now.month(quarterStartMonth).startOf('month')
      const end = now.month(quarterEndMonth).endOf('month')
      return [start, end]
    }

    // 获取本年的开始和结束日期
    const getYearRange = (): [Dayjs, Dayjs] => {
      const start = dayjs().startOf('year')
      const end = dayjs().endOf('year')
      return [start, end]
    }

    // 根据选择器的值更新日期范围
    const updateDateRangeBySelect = (value: string): void => {
      switch (value) {
        case 'LAST_MONTH':
          dateRange.value = getLastMonthRange()
          break
        case 'MONTH':
          dateRange.value = getMonthRange()
          break
        case 'QUARTER':
          dateRange.value = getQuarterRange()
          break
        case 'YEAR':
          dateRange.value = getYearRange()
          break
        default:
          dateRange.value = getMonthRange()
      }

      // 触发外部事件
      if (dateRange.value) {
        emitChange(dateRange.value)
      }
    }

    // 触发变更事件
    const emitChange = (dates: [Dayjs, Dayjs]): void => {
      const dateStrings: DateStringRange = [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
      emit('update:value', dates)
      emit('change', dates, dateStrings)
      if (typeof props.onChange === 'function') {
        props.onChange(dates, dateStrings)
      }
    }

    // 处理日期选择器变更
    const handleDateChange = (value: DateRange): void => {
      dateRange.value = value
      emitChange(dateRange.value as [Dayjs, Dayjs])
      selectValue.value = null
    }

    return (): JSX.Element => (
      <>
        <Select
          value={selectValue.value}
          style={{ width: '120px' }}
          placeholder={'选择时间'}
          size={'large'}
          onChange={(value: string) => {
            updateDateRangeBySelect(value)
          }}
          options={[
            { value: 'MONTH', label: '本月' },
            { value: 'LAST_MONTH', label: '上月' },
            { value: 'QUARTER', label: '本季度' },
            { value: 'YEAR', label: '今年' },
          ]}
          allowClear
        />
        <div class={styles["security-analysis-title-picker"]}>
          <RangePicker
            value={dateRange.value}
            allowClear={false}
            onChange={handleDateChange}
            size={'large'}
          />
        </div>
      </>
    )
  }
})
