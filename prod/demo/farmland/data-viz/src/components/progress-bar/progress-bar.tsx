import { defineComponent } from 'vue'
import styles from './progress-bar.module.less'
import CountTo from '@/components/count-to/count-to'

interface Props{
  unit: string;
  label: string;
  value: number;
  total: number;
  index: number;
  showSort: boolean;
}

export const ProgressBar = defineComponent({
  props: {
    showSort: {
      type: Boolean,
      default: true
    },
    index: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: false,
      default: ''
    }
  },
  emits: ['click'],
  setup (props: Props, { emit }) {
    return (): JSX.Element => (
      <div class={styles['progress-bar']} onClick={() => {
        emit('click', props)
      }}>
        <div class={styles['progress-bar-text']}>
          <div class={styles['progress-bar-text-wrapper']} >
            { props.showSort && <div class={[styles['progress-bar-sort'], styles['progress-bar-sort-' + props.index]]}>{props.index}</div> }
            <div class={styles['progress-bar-label']} title={props.label}>{props.label}</div>
          </div>
          <div class={styles['progress-bar-value']}>
            <CountTo startVal={0} endVal={props.value} duration={2000} separator='' />
            <span class={styles.unit}>{props.unit}</span>
          </div>
        </div>
        <div class={styles['progress-bar-inner-wrapper']}>
          <div class={styles['progress-bar-inner']} style={{ width: `${props.value / props.total * 100}%` }}></div>
        </div>
      </div>
    )
  }
})