import { defineComponent, type PropType } from 'vue'
import styles from './progress-bar.module.less'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";

interface ClickPayload {
  label: string;
  value: number;
  total: number;
  rank?: number;
}

export const ProgressBar = defineComponent({
  props: {
    label: {
      type: String as PropType<string>,
      required: true
    },
    unit: {
      type: String as PropType<string>,
      required: false
    },
    value: {
      type: Number as PropType<number>,
      required: true
    },
    total: {
      type: Number as PropType<number>,
      required: true
    },
    rank: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    showRank: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['click'],
  setup (props, { emit }) {
    const rankClass = props.rank && styles[`rank-${props.rank}`];

    const handleClick = () => {
      const payload: ClickPayload = { 
        label: props.label,
        value: props.value,
        total: props.total
      };
      if (props.rank !== undefined) {
        payload.rank = props.rank;
      }
      emit('click', payload);
    };

    return (): JSX.Element => (
      <div class={styles['progress-bar']} onClick={handleClick}>
        <div class={styles['progress-bar-text']}>
          <div class={styles['progress-bar-label']}>
            {props.showRank && props.rank !== undefined && (
              <span class={[styles.rank, rankClass]}>{props.rank}</span>
            )}
            <span title={props.label}>{props.label}</span>
          </div>
          <div class={styles['progress-bar-value']}>
            <CountTo startVal={0} endVal={props.value} duration={2000} separator=""></CountTo>
            {props.unit && <span class={styles.unit}>{props.unit}</span>}
          </div>
        </div>
        <div class={styles['progress-bar-inner-wrapper']}>
          <div class={styles['progress-bar-inner']} style={{ width: `${props.value > 0 ? props.value / props.total * 100 : 0}%` }}></div>
        </div>
      </div>
    )
  }
})