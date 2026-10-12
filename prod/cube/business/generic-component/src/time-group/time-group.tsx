import { Button, DateRangePicker } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

export const TimeGroup = defineComponent({
  props: ['value'],
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    const options = [
      { label: '今日', value: 'TODAY' },
      { label: '本周', value: 'THIS_WEEK' },
      { label: '本月', value: 'THIS_MONTH' },
      { label: '今年', value: 'THIS_YEAR' },
    ]
    const datePickerValue = ref<string[]>([])
    const currentTime = ref<string>('THIS_WEEK')

    const emitValue = (): void => {
      const res = {
        start: '',
        end: ''
      }
      let unit: dayjs.OpUnitType = 'days'
      if (currentTime.value === 'TODAY') {
        unit = 'days'
      } else if (currentTime.value === 'THIS_WEEK') {
        unit = 'weeks'
      } else if (currentTime.value === 'THIS_MONTH') {
        unit = 'months'
      } else if (currentTime.value === 'THIS_YEAR') {
        unit = 'year'
      }
      res.start = dayjs().startOf(unit).format('YYYY-MM-DD HH:mm:ss')
      res.end = dayjs().endOf(unit).format('YYYY-MM-DD HH:mm:ss')
      datePickerValue.value = [res.start, res.end]
      emit('update:value', {
        preiod: res.start + ',' + res.end,
        date: currentTime.value
      })
      emit('change', res.start + ',' + res.end)
    }
    const handleBtnClick = (val: string): void => {
      currentTime.value = val
      emitValue()
    }
    const changePicker = (data: string[]): void => {
      currentTime.value = ''
      emit('update:value', {
        preiod: data[0] + ',' + data[1],
        date: currentTime.value
      })
      emit('change', data[0] + ',' + data[1])
    }
    onMounted(() => {
      emitValue()
    })
    return () =>
      <>
        <div class='flex'>
          {options.map((item, index) => {
            return (
              <div key={index}>
                <Button style='margin-right: 10px;' type={currentTime.value === item.value ? 'primary' : 'default'} onClick={() => { handleBtnClick(item.value) }}>{item.label}</Button>
              </div>
            )
          })}
          <DateRangePicker showTime v-model:value={datePickerValue.value} valueFormat='YYYY-MM-DD HH:mm:ss' onChangePicker={changePicker} />
        </div>
      </>
  }
})
