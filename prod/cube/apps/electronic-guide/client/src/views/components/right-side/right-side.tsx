import { defineComponent } from 'vue'
import styles from './index.module.less'
import { getAssetsFile } from '@/utils'
import { PointList } from './component/point-list/point-list'
import { useClientStore } from '@/store/modules/client-store'
export const RightSide = defineComponent({
  setup: () => {
    const searchIcon = getAssetsFile('search-icon.png')
    const clientStore = useClientStore()
    // const state = reactive({
    //   searchValue: ''
    // })
    const handleSearch = (e: KeyboardEvent): void => {
      if (e.key === 'Enter') {
        clientStore.getPointList()
      }
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.search}>
          <img src={searchIcon} alt='' srcset='' /> <input v-model={clientStore.pointSearchParams.keyword} placeholder='输入关键词搜索' onKeyup={handleSearch} />
        </div>
        <div class={styles.listContainer}>
          <PointList />
        </div>
      </div>
    )
  }
})
