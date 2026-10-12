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
    return () =>
      <div class={styles.wrapper}>
        {
          props.cardItem.name || props.cardItem?.rTitle || slots.rTitle?.()
            ? (<div class={styles.header}>
              <div class={styles.title}>{props.cardItem.name}</div>
              <div class={styles.rTitle}>{props.cardItem?.rTitle ? props.cardItem?.rTitle : slots.rTitle?.()}</div>
            </div>)
            : null
        }
        {
          props.cardItem?.detail || slots.detail?.()
            ? <div class={styles.detail}> {props.cardItem?.detail ? props.cardItem?.detail : slots.detail?.()}</div>
            : null
        }

        <div class={styles.content}> {slots.content?.()}</div>
      </div>
  }
})
