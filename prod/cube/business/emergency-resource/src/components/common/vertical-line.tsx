import { defineComponent } from 'vue'
import styles from './vertical-line.module.less'
interface Props {
  title: string;
}
export const GVerticalLine = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
  },
  setup: (props: Props) => {
    return () =>
      <>
        <span class={`${styles.verticalLine} ${styles['primary-color-before']}`}>{props.title}</span>
      </>
  }
})
