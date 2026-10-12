import { defineComponent } from 'vue'
import styles from './index.module.less'
import { CountTo } from 'vue3-count-to'
const progressBackground = [
  '#48e5e5', '#3cd495', '#2b8ef3', '#3254dd'
]
export const AgeStat = defineComponent({
  props: {
    dataList: {
      type: Array as () => { key: string; value: string; }[],
      default: () => [
        {
          key: '20-30岁',
          value: '15',
        },
        {
          key: '30-40岁',
          value: '15',
        },
        {
          key: '40-50岁',
          value: '15',
        },
        {
          key: '50-60岁',
          value: '15',
        },
      ]
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        {props.dataList.map((item, index) => {
          return (
            <div class={styles['stat-item']} key={index}>
              <div class={styles['stat-top']}>
                <div class={styles['stat-title']}>{item.key}</div>
                <div class={styles['stat-value']}><CountTo startVal={0} endVal={Number(item.value)} duration={2000} />%</div>
              </div>
              <div class={styles['stat-progress']}>
                <div class={styles['stat-progress-bar']} style={{ width: item.value + '%', backgroundColor: progressBackground[index] }} />
              </div>
            </div>
          )
        })}

      </div>
    )
  }
})
