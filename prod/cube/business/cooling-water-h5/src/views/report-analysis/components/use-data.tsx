import { DatePicker } from '@/components/data-picker'
import { DateRangePicker } from '@/components/date-range-picker'
import { computed, defineComponent, nextTick, onMounted, ref } from 'vue'
import { UseDataListItem, type UseDataListItemProps } from './use-data-list-item'
import { Skeleton } from 'vant'
import { getCoolWaterUsedStatistics, getElectricityRate } from '@/api'
import dayjs from 'dayjs'
type PickeMode = 'Year' | 'Month' | 'TODAY'
/** 冷冻水使用数据 */
export const UseData = defineComponent({

  setup: () => {
    const loading = ref(false)
    const pickerMode = ref<PickeMode>('Year')
    const yearPickerRef = ref<{ getValue: () => string; }>()
    const monthPickerRef = ref<{ getValue: () => string[]; }>()
    const datePickerRef = ref<{ getValue: () => string[]; }>()
    const data = ref<UseDataListItemProps[]>([
      { field: 'electricity', iconBackgroud: '#0066FF', icon: './img/use-data-1.png', text: '冷冻水累计耗电（kw.h）', value: '233', rateChain: 0.33, rateYear: -0.33 },
      { field: 'cost', iconBackgroud: '#FBA01D', icon: './img/use-data-2.png', text: '累计费用（元）', value: '233.00', rateChain: 0.33, rateYear: -0.33 },
      { field: 'duration', iconBackgroud: '#18A886', icon: './img/use-data-3.png', text: '累计运行时长（小时）', value: '233', rateChain: 0.33, rateYear: -0.33 },
      { field: 'flow', iconBackgroud: '#0066FF', icon: './img/use-data-4.png', text: '累计使用流量（m³）', value: '233', rateChain: 0.33, rateYear: -0.33 },
    ])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          timeType: pickerMode.value,
          ...paramsPeriod.value
        }
        const resultCoolWaterUsed = await getCoolWaterUsedStatistics(params)
        const electricityRateRes = await getElectricityRate(params)
        for (const item of data.value) {
          const { field } = item
          if (field.includes('cost')) {
            item.value = resultCoolWaterUsed.data.costTotal
            item.rateChain = resultCoolWaterUsed.data.costRateQoq
            item.rateYear = resultCoolWaterUsed.data.costRateYoy
          }
          if (field.includes('duration')) {
            item.value = resultCoolWaterUsed.data.duration
            item.rateChain = resultCoolWaterUsed.data.durationRateQoq
            item.rateYear = resultCoolWaterUsed.data.durationRateYoy
          }
          if (field.includes('flow')) {
            item.value = resultCoolWaterUsed.data.flow
            item.rateChain = resultCoolWaterUsed.data.flowRateQoq
            item.rateYear = resultCoolWaterUsed.data.flowRateYoy
          }
          if (field.includes('ectricity')) {
            item.value = electricityRateRes.data.coldWaterElectricity
            item.rateChain = electricityRateRes.data.electricityRateQoq
            item.rateYear = electricityRateRes.data.electricityRateYoy
          }
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }
    const paramsPeriod = computed(() => {
      const pickerModeForParams: Record<PickeMode, { startTime: string;endTime: string; }> = {
        Year: {
          startTime: yearPickerRef.value?.getValue() ? `${yearPickerRef.value?.getValue()}-01-01` : '',
          endTime: ''
        },
        Month: {
          startTime: monthPickerRef.value?.getValue() ? dayjs(monthPickerRef.value?.getValue()[0]).format('YYYY-MM-DD') : '',
          endTime: monthPickerRef.value?.getValue() ? dayjs(monthPickerRef.value?.getValue()[1]).endOf('month').format('YYYY-MM-DD') : ''
        },
        TODAY: {
          startTime: datePickerRef.value?.getValue() ? datePickerRef.value?.getValue()[0] : '',
          endTime: datePickerRef.value?.getValue() ? datePickerRef.value?.getValue()[1] : ''
        }
      }
      return pickerModeForParams[pickerMode.value] ?? { startTime: '', endTime: '' }
    })
    /** 年月日切换 */
    const changePickerMode = (mode: PickeMode): void => {
      if (mode === pickerMode.value) {
        return
      }

      pickerMode.value = mode
      nextTick(() => {
        getData()
      })
    }

    onMounted(() => {
      getData()
    })

    /** 时间控件选择回调 */
    const onConfirm = (): void => {
      nextTick(() => {
        getData()
      })
    }

    return () =>
      <div class='card'>
        <div class='card-title'>
          <div class='left'>冷冻水使用数据</div>
          <div class='use-data-title-right'>
            <div class='picker-mode-select'>
              <span class={pickerMode.value === 'TODAY' ? 'active' : ''} onClick={() => { changePickerMode('TODAY') }}>日</span>
              <span class={pickerMode.value === 'Month' ? 'active' : ''} onClick={() => { changePickerMode('Month') }}>月</span>
              <span class={pickerMode.value === 'Year' ? 'active' : ''} onClick={() => { changePickerMode('Year') }}>年</span>
            </div>
          </div>

        </div>
        {/* 时间选择器 */}
        {pickerMode.value === 'Year' && <DatePicker mode='year' onConfirm={onConfirm} ref={yearPickerRef} />}
        {pickerMode.value === 'Month' && <><DateRangePicker mode='month' onConfirm={onConfirm} ref={monthPickerRef} /></>}
        {pickerMode.value === 'TODAY' && <DateRangePicker mode='date' onConfirm={onConfirm} ref={datePickerRef} />}

        {/* 列表 */}
        {data.value.map(e => {
          return (
            <Skeleton row='2' loading={loading.value} key={e.text}>
              <UseDataListItem
                iconBackgroud={e.iconBackgroud}
                icon={e.icon}
                text={e.text}
                value={e.value}
                rateChain={e.rateChain}
                rateYear={e.rateYear}
              />
            </Skeleton>
          )
        })}
      </div>
  }
})
