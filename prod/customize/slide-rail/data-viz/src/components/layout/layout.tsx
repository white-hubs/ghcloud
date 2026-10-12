import { defineComponent } from 'vue'
import styles from './layout.module.less'

export const Layout = defineComponent({
  setup (props, { slots }) {
    return (): JSX.Element => (
      <div class={styles['layout-container']}>
        <div class={styles.contents}>{slots.default?.()}</div>
      </div>
    )
  }
})
