import { defineComponent } from 'vue'
import styles from './index.module.less'
export const SubInTitle = defineComponent({
  props: {
    title: {
      type: String,
      default: '籍贯'
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        <img src='/apps/@ghcloud/higreen-data-viz/images/merchant/sub-in-title-icon.png' alt='' />
        <span>{props.title}</span>
      </div>
    )
  }
})
