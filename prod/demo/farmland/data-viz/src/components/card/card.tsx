import { defineComponent, type PropType } from 'vue'
import styles from './card.module.less'

interface CardProps {
  title: string;
}

export const Card = defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
  },
  setup (props: CardProps, { slots }) {
    return (): JSX.Element =>
      <div class={styles['card-container']}>
        <div class={styles['card-title']}>
          <div class={styles['mark']}>
            <div class={styles['box']}></div>
          </div>
          <span>{props.title}</span>
        </div>
        <div class={styles['line-box']}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class={styles['card-content']}>
          {slots.default?.()}
        </div>
        {slots.extra?.()}
      </div>
  },
})
