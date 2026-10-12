import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'

interface CardProps {
  title: string;
  titleSize?: 'small' | 'medium';
}

export const Card = defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    titleSize: {
      type: String as PropType<'small' | 'medium'>,
      default: 'small'
    }
  },
  setup (props: CardProps, { slots }) {
    return () =>
      <div class={styles['card-container']}>
        <div class={styles['card-head']}>
          <div class={styles['card-head-title']}>
            <span>{props.title}</span>
          </div>
          <div class={styles['card-state']}>
            {slots['card-state']?.()}
          </div>
        </div>
        <div class={styles['card-body']}>
          {slots['card-body']?.()}
        </div>
      </div>
  },
})
