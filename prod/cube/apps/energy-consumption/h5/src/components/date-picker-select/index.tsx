import { defineComponent, reactive, type PropType, watch } from 'vue'
import { PickerGroup, Popup, Tabs, Tab, showNotify } from 'vant'
import styles from './index.module.less'
import VueHashCalendar from 'vue3-hash-calendar'
import dayjs from 'dayjs'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR'

/** 日期范围选择 */
export const DatePickerSelector = defineComponent({
  props: {
    selectType: {
      type: String as PropType<SelectType>,
      default: () => 'TODAY'
    },
    value: {
      type: Array as PropType<string[]>,
      default: () => ['2024-04-01 00:00', '2024-04-01 10:00']
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
        start: '',
        end: '',
      }
    })
    watch(() => state.active, () => {
      if (state.active === 'TODAY') {
        state.date = {
          start: dayjs().format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm')
        }
      }
      if (state.active === 'THIS_WEEK') {
        state.date = {
          start: dayjs().add(0, 'week').startOf('week').add(1, 'day').format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm'),
        }
      }
      if (state.active === 'THIS_MONTH') {
        state.date = {
          start: dayjs().startOf('month').format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm'),
        }
      }
      if (state.active === 'THIS_YEAR') {
        state.date = {
          start: dayjs().startOf('year').format('YYYY-MM-DD 00:00'),
          end: dayjs().format('YYYY-MM-DD HH:mm'),
        }
      }
      emit('change', state.date, state.active)
    }, { immediate: true })
    const pickerConfirm = (): void => {
      if (new Date(state.date.start).getTime() > new Date(state.date.end).getTime()) {
        showNotify('开始时间不能大于结束时间')
        return
      }
      state.show = false
      emit('change', state.date, state.active)
    }
    const handleChange = (value: string, type: 'start' | 'end'): void => {
      if (type === 'start') {
        if (new Date(value).getTime() >= new Date(state.date.end).getTime()) {
          showNotify('开始时间不能大于结束时间')
          return
        }
      }
      if (type === 'end') {
        if (new Date(state.date.start).getTime() >= new Date(value).getTime()) {
          showNotify('开始时间不能大于结束时间')
          return
        }
      }
      state.date[type] = value
    }
    return () =>
      <div class={styles.container}>
        <div class={styles.topTabs}>
          <Tabs v-model:active={state.active}>
            <Tab title='今日' name='TODAY' />
            <Tab title='本周' name='THIS_WEEK' />
            <Tab title='本月' name='THIS_MONTH' />
            <Tab title='今年' name='THIS_YEAR' />
          </Tabs>
        </div>
        <div style={{ height: '60px', width: '100%' }} />
        <div class={styles.content} onClick={() => { state.show = true }}>
          {state.date.start} ~ {state.date.end}
        </div>
        <Popup v-model:show={state.show} position='bottom'>
          <PickerGroup title='时间选择' tabs={['开始时间', '结束时间']} onConfirm={pickerConfirm} key={new Date().getTime()}>
            <VueHashCalendar disabled-scroll='vertical' format='YY/MM/DD hh:mm' onChange={(e) => { handleChange(e, 'start') }} defaultDatetime={new Date(state.date.start)} />
            <VueHashCalendar disabled-scroll='vertical' format='YY/MM/DD hh:mm' onChange={(e) => { handleChange(e, 'end') }} defaultDatetime={new Date(state.date.end)} />
          </PickerGroup>
        </Popup>
      </div>
  }
})
