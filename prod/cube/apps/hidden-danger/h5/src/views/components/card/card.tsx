import { defineComponent } from 'vue'
import styles from './card.module.less'

export const CardItem = defineComponent({
  props: {
    cardItem: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup (props, { slots }) {
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <div class={styles.title}>{props.cardItem.name}</div>
          <div class={styles.rTitle}>{props.cardItem?.rTitle ? props.cardItem?.rTitle : slots.rTitle?.()}</div>
        </div>
        <div class={styles.detail}> {props.cardItem?.detail ? props.cardItem?.detail : slots.detail?.()}</div>
        <div class={styles.content}> {slots.content?.()}</div>
      </div>
  }
})
