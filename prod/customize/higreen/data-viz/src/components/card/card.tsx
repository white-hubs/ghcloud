import { defineComponent, type PropType } from 'vue'
import styles from './card.module.less'

interface CardProps {
  title: string;
  titleIcon: string;
  titleSize?: 'small' | 'medium';
}

export const Card = defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    titleIcon: {
      type: String,
      default: '/apps/@ghcloud/higreen-data-viz/icons/card-title/default.webp'
    },
    titleSize: {
      type: String as PropType<'small' | 'medium'>,
      default: 'small'
    }
  },
  setup (props: CardProps, { slots }) {
    return (): JSX.Element =>
      <div class={styles['card-container']}>
        <div class={styles['card-title']}>
          <img src={props.titleIcon} />
          <span>{props.title}</span>
        </div>
        <div class={styles['card-stat']}>
          {slots['card-stat']?.()}
        </div>
        <div class={styles['card-charts']}>
          {slots['card-charts']?.()}
        </div>
      </div>
  },
})
