import { Empty } from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'
import styles from './page-off.module.less'

export const PageOff = defineComponent({
  setup: () => {
    return (): JSX.Element =>
      <div class={styles['page-off']}>
        <Empty description='链接已关闭' />
      </div>
  }
})
