import { defineComponent } from 'vue'
import styles from './index.module.less'
import { useClientStore } from '@/store/modules/client-store'
import type { RegionVo } from '@ghcloud/electronic-guide-service'
export const LeafList = defineComponent({
  setup: () => {
    const clientStore = useClientStore()
    const handleClick = (item: RegionVo): void => {
      clientStore.leafId = item.id
      clientStore.pointSearchParams.areaId = item.id
      // clientStore.getPointList()
      clientStore.areaIdChangeAction()
    }
    return (): JSX.Element => (
      <>
        {!!clientStore.leafList.length &&
          <div class={styles.container}>
            {clientStore.leafList.map(item => {
              return <div class={[styles.item, clientStore.leafId === item.id && styles.active]} key={item.id} onClick={() => { handleClick(item) }}>{item.name}</div>
            })}
          </div>}

      </>

    )
  }
})
