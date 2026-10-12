import { computed, defineComponent, ref, watch } from 'vue'
import { Icon, DatePicker as VDatePicker, Popup } from 'vant'
import dayjs, { type Dayjs } from 'dayjs'

interface Props {
  value?: string;
  mode?: 'year' | 'month' | 'date';
  minDate?: string;
  maxDate?: string;
}

/** 年 月 日 选择器 */
export const DatePicker = defineComponent({
  props: ['value', 'mode', 'minDate', 'maxDate'],
  emits: ['confirm'],
  setup: (props: Props, { emit, expose }) => {
    const dayJs2Date = (dayJsObj: Dayjs): Date => {
      return new Date(dayJsObj.year(), dayJsObj.month(), dayJsObj.date())
    }

    const pickerOptions = computed(() => {
      const res = {
        format: '',
        title: '',
        pickerType: [''],
        minDate: dayJs2Date(dayjs().subtract(10, 'year')),
        maxDate: dayJs2Date(dayjs().add(10, 'year')),
      }
      const mode = props.mode ?? 'date'
      if (mode === 'date') {
        res.format = 'YYYY-MM-DD'
        res.title = '选择日期'
        res.pickerType = ['year', 'month', 'day']
      } else if (mode === 'month') {
        res.format = 'YYYY-MM'
        res.title = '选择年月'
        res.pickerType = ['year', 'month']
      } else {
        res.format = 'YYYY'
        res.title = '选择年'
        res.pickerType = ['year']
      }

      if (props.maxDate) {
        res.maxDate = dayJs2Date(dayjs(props.maxDate))
      }
      if (props.minDate) {
        res.minDate = dayJs2Date(dayjs(props.minDate))
      }
      return res
    })
    const getInitDate = (timeString?: string): string[] => {
      const mode = props.mode ?? 'date'
      const dayJsObj = timeString ? dayjs(timeString) : dayjs()
      const year = dayJsObj.year().toString()
      const month = (dayJsObj.month() + 1).toString()
      const date = dayJsObj.date().toString()
      if (mode === 'date') {
        return [year, month, date]
      } else if (mode === 'month') {
        return [year, month]
      } else {
        return [year]
      }
    }
    watch(() => props.mode, () => {
      value.value = getInitDate(value.value.join('-'))
      onConfirm({ selectedValues: value.value })
    })

    const value = ref(getInitDate())
    const showPicker = ref(false)
    /** 回显时间 */
    const calcValue = computed(() => {
      return dayjs(value.value.join('-')).format(pickerOptions.value.format)
    })
    /** 确认回调 */
    const onConfirm = ({ selectedValues }: { selectedValues: string[]; }): void => {
      value.value = selectedValues
      emit('confirm', selectedValues.join('-'))
      showPicker.value = false
    }
    /** 弹层打开 */
    const onOpen = (): void => {
      if (props.value) {
        value.value = getInitDate(props.value)
      } else if (value.value.length) {
        value.value = getInitDate(value.value.join('-'))
      }
    }

    expose({
      getValue: () => value.value.join('-')
    })
    return () =>
      <>
        <div class='data-picker' onClick={() => { showPicker.value = true }}>
          <div class='content'>{calcValue.value}</div>
          <Icon name='notes-o' />
        </div>
        <Popup v-model:show={showPicker.value} position='bottom' style='height: 30%' onOpen={onOpen}>
          <VDatePicker
            title={pickerOptions.value.title}
            columns-type={pickerOptions.value.pickerType}
            modelValue={value.value}
            onCancel={() => { showPicker.value = false }}
            onConfirm={onConfirm}
            minDate={pickerOptions.value.minDate}
            maxDate={pickerOptions.value.maxDate}
          />
        </Popup>
      </>
  }
})
