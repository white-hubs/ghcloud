import { defineComponent } from 'vue'
import styles from './index.module.less'
export const Card = defineComponent({
  props: {
    title: {
      type: String,
      default: '任务事项',
    },
  },
  setup: (props, { slots }) => {
    return (): JSX.Element => (
      <>
        <div class={styles['card-container']}>
          <div class={styles['card-title']}>
            {props.title}
          </div>
          <div class={styles['card-content']}>
            {slots.default?.()}
          </div>
        </div>
      </>
    )
  },
})
