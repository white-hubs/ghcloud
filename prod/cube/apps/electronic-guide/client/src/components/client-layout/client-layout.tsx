import { defineComponent } from 'vue'
import styles from './index.module.less'
export const ClientLayout = defineComponent({
  setup: (props, { slots }) => {
    return (): JSX.Element => (
      <div class={styles.container} id='client-layout'>
        <div class={styles.header}>
          {slots.header?.()}
        </div>
        <div class={styles.leftSide}>
          {slots['left-side']?.()}
        </div>
        <div class={styles.rightSide}>
          {slots['right-side']?.()}
        </div>
        <div class={styles.footer}>
          {slots.footer?.()}
        </div>
        {slots.default?.()}
      </div>
    )
  }
})
