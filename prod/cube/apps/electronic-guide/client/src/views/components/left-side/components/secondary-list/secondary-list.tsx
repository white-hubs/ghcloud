import { defineComponent, watch } from 'vue'
import styles from './index.module.less'
import { useClientStore } from '@/store/modules/client-store'
import type { RegionVo } from '@ghcloud/electronic-guide-service'
export const SecondaryList = defineComponent({
  setup: () => {
    const clientStore = useClientStore()
    watch(() => [clientStore.regionId], () => {
      clientStore.secondaryId = ''
      clientStore.setLeafList([])
    })
    const handleClick = (item: RegionVo): void => {
      clientStore.secondaryId = item.id
      clientStore.leafId = ''
      clientStore.setLeafList(item.children ?? [])
      clientStore.pointSearchParams.areaId = item.id
      clientStore.areaIdChangeAction()
    }
    return (): JSX.Element => (
      <>
        {!!clientStore.secondaryList.length &&
          <div class={styles.container}>
            {clientStore.secondaryList.map(item => {
              return <div class={[styles.item, clientStore.secondaryId === item.id && styles.active]} key={item.id} onClick={() => { handleClick(item) }}>{item.name}</div>
            })}
          </div>}
      </>

    )
  }
})
