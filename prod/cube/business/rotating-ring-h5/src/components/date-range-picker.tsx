import { defineComponent, ref } from 'vue'
import { DatePicker } from './data-picker'
import dayjs from 'dayjs'

interface Props {
  mode: 'date' | 'month';
}

export const DateRangePicker = defineComponent({
  props: ['mode'],
  emits: ['confirm'],
  setup: (props: Props, { emit, expose }) => {
    const getInitDate = (): string[] => {
      if (props.mode === 'date') {
        return [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      } else {
        return [dayjs().format('YYYY-MM'), dayjs().format('YYYY-MM')]
      }
    }
    const value = ref(getInitDate())
    const onConfirm = (val: string, index: number): void => {
      value.value[index] = val
      emit('confirm', value.value)
    }

    expose({
      getValue: () => value.value
    })

    return () =>
      <div class='double-date-picker'>
        <DatePicker mode={props.mode} maxDate={value.value[1]} onConfirm={(val: string) => { onConfirm(val, 0) }} />
        <span class='split'>——</span>
        <DatePicker mode={props.mode} minDate={value.value[0]} onConfirm={(val: string) => { onConfirm(val, 1) }} />
      </div>
  }
})
