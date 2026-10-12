import { defineComponent } from 'vue'
import styles from './styles/no-data.module.less'
import { getAssetsImge } from '@/utils/get-image'
export default defineComponent({
  name: 'no-data',
  setup () {
    return () =>
      <div class={styles.box}>
        <div class={styles.content}>
          <img src={getAssetsImge('exception/nodata.svg')} alt='' />
          <div>暂无数据</div>
        </div>
      </div>
  }
})
