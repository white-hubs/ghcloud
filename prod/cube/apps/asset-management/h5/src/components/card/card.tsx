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
        {props.cardItem.name || props.cardItem?.rTitle
          ? <div class={styles.header} v-show={props.cardItem.name || props.cardItem?.rTitle}><div class={styles.title}>{props.cardItem.name}</div><div class={styles.rTitle}>{props.cardItem?.rTitle ? props.cardItem?.rTitle : slots.rTitle?.()}</div></div>
          : null}
        <div class={styles.content}>
          {props.cardItem?.img
            ? <div class={styles.img} v-show={props.cardItem?.img}><img style='width:40px;height:40px;' src={props.cardItem?.img} alt='' /></div>
            : null}

          <div class={styles.detail}>{slots.detail?.()}</div>
        </div>
      </div>
  }
})
