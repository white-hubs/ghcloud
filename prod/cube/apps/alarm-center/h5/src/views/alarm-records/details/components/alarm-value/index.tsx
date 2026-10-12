import { defineComponent } from 'vue'
import styles from './index.module.less'
export const AlarmValue = defineComponent({
  props: {
    label: {
      type: String,
      default: () => '温度'
    },
    value: {
      type: String,
      default: () => '100'
    },
    unit: {
      type: String,
      default: () => ''
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <>
        <div class={styles.alarmValue}>
          <span class={styles.alarmValueLabel}>报警值({props.label})</span>
          <span class={styles.alarmValueValue}>{props.value}{props.unit}</span>
        </div>
      </>
    )
  }
})
