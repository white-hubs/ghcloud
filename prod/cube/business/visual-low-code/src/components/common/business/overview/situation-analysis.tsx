import { defineComponent, type PropType } from 'vue'
import { getAssetsImge } from '@/utils/get-image'
import styles from './style/situation-analysis.module.less'
import { CountTo } from 'vue3-count-to'
interface Item {
  label: string;
  value: number;
  color: string;
}
interface StatisticType {
  title: string;
  total: number;
  itemize: Item[];
}
export default defineComponent({
  emits: ['clickNum'],
  name: 'situation-analysis',
  props: {
    imgPath: { type: String, default: '' },
    statistic: {
      type: Object as PropType<StatisticType>,
      default: () => {}
    }
  },
  setup (props, { emit }) {
    const clickNum = (item?: Item): void => {
      emit('clickNum', item)
    }
    return () =>
      <div class={`${styles['situation-analysis']} ${styles['flex-between']}`}>
        <div class={styles.left}>
          <div class={styles.bg}>
            <img src={getAssetsImge('exception/over-view4.png')} />
            <img class={styles.rotate} src={getAssetsImge(`exception/${props.imgPath}`)} />
          </div>
        </div>
        <div class={styles.right}>
          <div class={`${styles.total} ${styles['flex-between']}`}>
            <div class={styles.title}>{props.statistic.title}</div>
            <div class={styles.count} onClick={() => { clickNum() }}>
              <CountTo
                startVal={0}
                endVal={props.statistic.total}
                duration={4000}
                class={styles['scroll-number']}
              />
            </div>
          </div>
          <div class={styles.list}>
            {
          props.statistic.itemize.map(item =>
            <div key={item.value} class={`${styles['list-item']} ${styles['flex-between']}`} onClick={() => { clickNum(item) }}>
              <div class={styles.label}>{item.label}</div>
              <div class={styles.value} style={{ color: item.color }}>
                <CountTo
                  startVal={0}
                  endVal={item.value}
                  duration={4000}
                  class={styles['scroll-number']}
                />
              </div>
            </div>
          )
        }
          </div>
        </div>
      </div>
  }
})
