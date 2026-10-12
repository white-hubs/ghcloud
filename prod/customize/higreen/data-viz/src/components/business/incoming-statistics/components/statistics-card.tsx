import { defineComponent } from 'vue'
import styles from './statistics-card.module.less'
import { CountTo } from 'vue3-count-to'

interface StatisticsProps {
  ratio: number;
  value: number;
}
export const StatisticsCard = defineComponent({
  props: {
    ratio: {
      type: Number,
      default: 0
    },
    value: {
      type: Number,
      default: 0
    }
  },
  setup () {
    return (props: StatisticsProps): JSX.Element =>
      <>
        <div class={[styles['statistics-box']]}>
          <div class={styles['statistics-title']}>
            <img src='/apps/@ghcloud/higreen-data-viz/images/weight.png' class={`${styles.slide} animate__animated animate__slideInLeft`} />
            <span>
              昨日来货重量
            </span>
          </div>
          <div class={styles['statistics-value']}>
            <CountTo class={styles['statistics-count']} startVal={0} endVal={props.value} duration={2000} separator=',' />
            <span class={styles['statistics-unit']}>吨</span>
            <div class={styles['statistics-ratio']}>
              <span class={styles.mode}>环比</span>
              <span class={`${styles['down-triangle']} ${props.ratio > 0 ? styles['up-triangle'] : ''}`} />
              <span class={`${props.ratio < 0 ? styles.down : styles.up} `}>{props.ratio}%</span>
            </div>
          </div>
        </div>
      </>
  }
})
