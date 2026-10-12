import { defineComponent, onMounted, ref } from 'vue'
import styles from './index.module.less'
import { regionService } from '@/apis/service'
import { useClientStore } from '@/store/modules/client-store'
import { useMapStore } from '@/store/modules/map-store'
import type { RegionVo } from '@ghcloud/electronic-guide-service'
import { getAssetsFile } from '@/utils'
export const SupremeList = defineComponent({
  setup: () => {
    // const nextPageIcon = getAssetsFile('next-page.png')
    const clientStore = useClientStore()
    const mapStore = useMapStore()
    const containerRef = ref<HTMLDivElement>()
    const firstRegion = ref<RegionVo>()
    const listRef = ref<HTMLDivElement>()
    let firstVo: RegionVo | null = null
    // 初始化数据
    const getData = async (): Promise<void> => {
      const result = await regionService.getRegionTree()
      firstVo = result[0]
      firstRegion.value = { ...firstVo, children: [] }
      const regionList = [...firstVo.children ?? []]
      clientStore.regionTreeList = result
      clientStore.rootId = firstVo.id
      clientStore.pointSearchParams.areaId = firstRegion.value.id
      clientStore.regionId = firstRegion.value.id
      clientStore.setRegionList(regionList)
    }
    const handleClick = async (item: RegionVo): Promise<void> => {
      clientStore.regionId = item.id
      clientStore.pointSearchParams.areaId = item.id
      clientStore.secondaryId = ''
      clientStore.setSecondaryList(item.children)
      clientStore.leafId = ''
      clientStore.setLeafList([])
      await clientStore.areaIdChangeAction()
      // if (item.id === firstVo?.id) {
      //   addRegionMarker()
      // }
    }
    const addRegionMarker = (): void => {
      for (const region of clientStore.regionList) {
        const lngLat = [Number(region.coordinate.split(',')[1]), Number(region.coordinate.split(',')[0])] as [number, number]
        const imageUrl = getAssetsFile('region-icon.png')
        mapStore.getMapInstance.addAreaMark(lngLat, imageUrl, region)
      }
    }
    onMounted(async () => {
      await getData()
      if (!mapStore.getMapInstance.mapInstance) {
        setTimeout(async () => {
          firstVo && mapStore.getMapInstance.setZoomRange(+firstVo.zoom - 0.5, 20)
          await clientStore.areaIdChangeAction()
          addRegionMarker()
        }, 1500)
      } else {
        firstVo && mapStore.getMapInstance.setZoomRange(+firstVo.zoom - 0.5, 20)
        await clientStore.areaIdChangeAction()
        addRegionMarker()
      }
    })
    return (): JSX.Element => (
      <div class={styles.container} ref={containerRef}>
        <div class={[styles.all, styles.item, clientStore.regionId === firstRegion.value?.id && styles.active]} onClick={() => {
          handleClick(firstRegion.value as unknown as RegionVo)
        }}>{firstRegion.value?.name}</div>

        <div class={styles.list} ref={listRef}>
          {clientStore.regionList.map((item, index) => {
            return <div class={[styles.item, clientStore.regionId === item.id && styles.active, index === 1 && 'list-item']} key={item.id} onClick={() => {
              handleClick(item)
            }}>{item.name}</div>
          })}
        </div>
        <div class={styles.tips}>
          <span>上下滑动</span>
        </div>

      </div>
    )
  }
})
