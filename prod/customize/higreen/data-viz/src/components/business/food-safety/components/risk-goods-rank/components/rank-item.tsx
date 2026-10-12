import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import { CountTo } from 'vue3-count-to'
const rankClass = [
  'one',
  'two',
  'three',
  'normal'
]
export const RankItem = defineComponent({
  props: {
    item: {
      type: Object as PropType<{
        name: string;
        count: number;
        progress: number;
      }>,
      default: () => ({
        name: '茄子',
        count: 0,
        progress: 0,
      })
    },
    index: {
      type: Number,
      default: 0
    }
  },
  setup: (props) => {
    return (): JSX.Element=> (
      <div class={styles.rankItem}>
        <div class={styles['rank-info']}>
          <div class={styles['info-left']}>
            <div class={styles['rank-num']}>No.{props.index + 1}</div>
            <div class={styles['rank-name']}>{props.item.name}</div>
          </div>
          <div class={styles['info-right']}>
            不合格 <span class={styles.count}><CountTo startVal={0} endVal={props.item.count} duration={1000} /></span> 次
          </div>
        </div>
        <div class={styles['rank-progress']}>
          <div class={[styles['progress-bar'], styles[rankClass[props.index] ?? 'normal']]} style={{ width: `${props.item.progress}%` }} />
        </div>
      </div>
    )
  }
})
