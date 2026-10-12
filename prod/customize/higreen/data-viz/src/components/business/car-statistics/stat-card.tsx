import { defineComponent, type PropType } from 'vue'
import styles from './stat-card.module.less'
import { CountTo } from 'vue3-count-to'

interface DataList {
  iconUrl: string;
  name: string;
  value: number;
  unit?: string;
  sign?: string;
  ratio?: number;
}
export const StatCard = defineComponent({
  props: {
    dataList: {
      type: Array as PropType<DataList[]>,
      required: true,
      default: () => []
    },
    isTransport: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props) {
    return (): JSX.Element => (
      <div class={`${styles.container} ${props.isTransport ? styles.w240 : ''}`}>
        {props.dataList.map((item, index) => {
          return (
            <div class={styles.statItem} key={index}>
              <div class={styles.statContent}>
                <div class={styles.statTitle}>
                  <img src={item.iconUrl} alt='' srcset='' /> <span>{item.name}</span>
                </div>
                <div class={styles.statValue}>
                  <CountTo startVal={0} endVal={item.value} duration={2000} />
                  <span class={styles.unit}>{item.unit}</span>
                </div>
                {
                  item.ratio &&
                    <div class={styles['statistics-ratio']}>
                      <span class={styles.mode}>环比</span>
                      <span class={`${styles['down-triangle']} ${item.ratio > 0 ? styles['up-triangle'] : ''}`} />
                      <span class={`${item.ratio < 0 ? styles.down : styles.up} `}>{item.ratio}%</span>
                    </div>
                }
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
