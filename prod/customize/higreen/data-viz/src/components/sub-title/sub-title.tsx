import { defineComponent } from 'vue'
import styles from './index.module.less'
export const SubTitle = defineComponent({
  props: {
    title: {
      type: String,
      default: '近一周食安检测次数',
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.title}>
        <span>{props.title}</span>
        <img src='/apps/@ghcloud/higreen-data-viz/images/item-title-bg.png' alt='' />
      </div>
    )
  }
})
