import { defineComponent, reactive, watch, type PropType } from 'vue'
import { PickerGroup, Popup, Tabs, Tab, showNotify } from 'vant'
import styles from './index.module.less'
import VueHashCalendar from 'vue3-hash-calendar'
import dayjs from 'dayjs'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'

/** 日期范围选择 */
export const DatePickerSelector = defineComponent({
  props: {
    selectType: {
      type: String as PropType<SelectType>,
      default: () => 'TODAY'
    },
    value: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['change'],
  setup (props, { emit }) {
    const state = reactive<{ show: boolean;active: SelectType; date: {
      start: string;
      end: string;
    }; }>({
      show: false,
      active: props.selectType,
      date: {
        start: props.value[0] ? props.value[0] : dayjs().startOf('month').format('YYYY-MM-DD 00:00'),
        end: props.value[1] ? props.value[1] : dayjs().format('YYYY-MM-DD HH:mm')
      }
    })
    const pickerDate = reactive({
      start: props.value[0] ? props.value[0] : dayjs().startOf('month').format('YYYY-MM-DD 00:00'),
      end: props.value[1] ? props.value[1] : dayjs().format('YYYY-MM-DD HH:mm')
    })
    watch(() => props.value, () => {
      state.active = props.selectType
      state.date.start = props.value[0] ? props.value[0] : dayjs().startOf('month').format('YYYY-MM-DD 00:00')
      state.date.end = props.value[1] ? props.value[1] : dayjs().format('YYYY-MM-DD HH:mm')
      pickerDate.start = props.value[0] ? props.value[0] : dayjs().startOf('month').format('YYYY-MM-DD 00:00')
      pickerDate.end = props.value[1] ? props.value[1] : dayjs().format('YYYY-MM-DD HH:mm')
      // emit('change', state.date, state.active)
    })

    const pickerConfirm = (): void => {
      if (new Date(pickerDate.start).getTime() > new Date(pickerDate.end).getTime()) {
        showNotify('开始时间不能大于结束时间')
        return
      }
      state.date.start = pickerDate.start.replace(/\//g, '-')
      state.date.end = pickerDate.end.replace(/\//g, '-')
      state.show = false
      state.active = 'CUSTOM'
      emit('change', state.date, state.active)
    }
    const handleChange = (value: string, type: 'start' | 'end'): void => {
      pickerDate[type] = value
      if (pickerDate.start === pickerDate.end) {
        pickerDate.end = ''
      }
    }
    const handleChangeTabs = (value: string): void => {
      if (value === 'CUSTOM') return
      if (value === 'TODAY') {
        state.date = {
          start: dayjs().format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm')
        }
      }
      if (value === 'THIS_WEEK') {
        state.date = {
          start: dayjs().startOf('week').format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm'),
        }
      }
      if (value === 'THIS_MONTH') {
        state.date = {
          start: dayjs().startOf('month').format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm'),
        }
      }
      if (value === 'THIS_YEAR') {
        state.date = {
          start: dayjs().startOf('year').format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm'),
        }
      }
      pickerDate.start = state.date.start.replace(/-/g, '/')
      pickerDate.end = state.date.end.replace(/-/g, '/')
      emit('change', state.date, value)
    }
    return (): JSX.Element =>
      <div class={styles.container}>
        <div class={[styles.topTabs, state.active === 'CUSTOM' ? styles.activeNull : styles.active]}>
          <Tabs v-model:active={state.active} onChange={handleChangeTabs}>
            <Tab title='今日' name='TODAY' />
            <Tab title='本周' name='THIS_WEEK' />
            <Tab title='本月' name='THIS_MONTH' />
            <Tab title='今年' name='THIS_YEAR' />
            <Tab title='今年' name='CUSTOM' title-class={styles.lastTab} />
          </Tabs>
        </div>
        <div style={{ height: '60px', width: '100%' }} />
        <div class={styles.content} onClick={() => {
          state.show = true
        }}>
          {state.date.start} ~ {state.date.end}
        </div>
        <Popup v-model:show={state.show} position='bottom'>
          <PickerGroup onCancel={(): void => {
            state.show = false
          }} title='时间选择' tabs={['开始时间', '结束时间']} onConfirm={pickerConfirm} key={new Date().getTime()}>
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e) => {
              handleChange(e, 'start')
            }} defaultDatetime={new Date(pickerDate.start)} show-today-button={false} />
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e) => {
              handleChange(e, 'end')
            }} defaultDatetime={new Date(pickerDate.end)} show-today-button={false} />
          </PickerGroup>
        </Popup>
      </div>
  }
})
