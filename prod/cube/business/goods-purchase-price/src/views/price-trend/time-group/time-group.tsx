import { Button, DateRangePicker } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { defineComponent, onMounted, ref, watch } from 'vue'

export const TimeGroup = defineComponent({
  props: ['value'],
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    const options = [
      { label: '近1个月', value: 'ONE_MONTH' },
      { label: '近3个月', value: 'THREE_MONTH' },
      { label: '近半年', value: 'SIX_MONTH' },
      { label: '近1年', value: 'YEAR' },
    ]
    const datePickerValue = ref<string[]>([])
    const currentTime = ref<string>('ONE_MONTH')
    const dateType = 'YYYY-MM-DD HH:mm:ss'

    const emitValue = (): void => {
      const end = dayjs().format(dateType)
      let start = null
      switch (currentTime.value) {
        case 'ONE_MONTH':
          start = dayjs().subtract(1, 'month').format(dateType)
          break
        case 'THREE_MONTH':
          start = dayjs().subtract(3, 'month').format(dateType)
          break
        case 'SIX_MONTH':
          start = dayjs().subtract(6, 'month').format(dateType)
          break
        case 'YEAR':
          start = dayjs().subtract(1, 'year').format(dateType)
          break
        default:
          start = dayjs().add(-1, 'month').format(dateType)
          break
      }
      emit('update:value', {
        preiod: start + ',' + end,
        date: currentTime.value
      })
      emit('change', start + ',' + end, currentTime.value)
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
      emit('change', data[0] + ',' + data[1], currentTime.value)
    }
    onMounted(() => {
      emitValue()
    })
    watch(

      () => props.value,
      () => {
        if (!props.value) {
          currentTime.value = 'ONE_MONTH'
          emitValue()
        }
      }, { deep: true }
    )
    return (): JSX.Element =>
      <>
        <div class='flex'>
          {options.map((item, index) => {
            return (
              <div key={index}>
                <Button style='margin-right: 10px;' type={currentTime.value === item.value ? 'primary' : 'default'} onClick={() => {
                  handleBtnClick(item.value)
                }}>{item.label}</Button>
              </div>
            )
          })}
          <DateRangePicker showTime v-model:value={datePickerValue.value} valueFormat={dateType} onChangePicker={changePicker} />
        </div>
      </>
  }
})
