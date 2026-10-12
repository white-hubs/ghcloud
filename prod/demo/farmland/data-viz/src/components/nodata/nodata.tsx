import { defineComponent } from 'vue'
import styles from './nodata.module.less'

export const Nodata = defineComponent({
  name: 'Nodata',
  setup () {
    return (): JSX.Element => (
      <div class={styles.box}>
        <div class={styles.content}>
          <img src='/apps/@ghcloud/farmland-data-viz/images/noData.png' alt="暂无数据" />
          <div>暂无数据</div>
        </div>
      </div>
    )
  }
})