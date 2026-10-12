import { defineComponent } from 'vue'
import styles from './index.module.less'

export const Card = defineComponent({
  props: {
    title: {
      type: String,
      default: '默认标题'
    }
  },
  setup: (props, { slots }) => {
    return (): JSX.Element => (
      <div class={styles.infoCard}>
        <div class={styles.title}>{props.title}</div>
        <>
          {slots.default?.()}
        </>
      </div>
    )
  }
})
