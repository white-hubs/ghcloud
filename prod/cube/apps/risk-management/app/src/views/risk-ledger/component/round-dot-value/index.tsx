import { defineComponent } from 'vue'
import styles from './index.module.less'
export const RoundDotValue = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <div class={styles['round-dot-value']}>
        <div class={styles['round-dot']}>
          <div class={styles.dot} />
        </div>
        <div class={styles.value}>
          在线
        </div>
      </div>

    )
  }
})
