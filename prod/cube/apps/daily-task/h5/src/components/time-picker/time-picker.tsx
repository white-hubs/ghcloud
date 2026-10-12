import { defineComponent, reactive, type VNode } from 'vue'
import styles from './time-picker.module.less'
import { timePeriod } from '@/utils'
export const TimePicker = defineComponent({
  emits: ['change'],
  props: {
    style: {
      type: Object,
      default: {}
    },

  },
  setup (props, { emit }) {
    const timeOptions = [
      { label: '今日', value: timePeriod('TODAY'), name: 'TODAY' },
      { label: '本周', value: timePeriod('WEEK'), name: 'THIS_WEEK' },
      { label: '本月', value: timePeriod('MONTH'), name: 'THIS_MONTH' },
      { label: '今年', value: timePeriod('THIS_YEAR'), name: 'THIS_YEAR' },
    ]
    const timeSelect = reactive({
      value: timePeriod(),
      name: 'TODAY'
    })
    const timeChange = (item: { value: string; name: string; }): void => {
      timeSelect.value = item.value
      timeSelect.name = item.name
      emit('change', timeSelect)
    }
    return (): VNode =>
      <div class={styles['time-picker']} style={props.style}>
        {
          timeOptions.map(e =>
            <div
              key={e.label}
              class={`${e.value === timeSelect.value ? styles['time-picker-selected'] : ''} `}
              onClick={() => {
                timeChange(e)
              }}
            >
              {e.label}
            </div>)
        }
      </div>
  }
})
