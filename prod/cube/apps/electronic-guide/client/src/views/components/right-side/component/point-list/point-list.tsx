import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { useClientStore } from '@/store/modules/client-store'
import { useMapStore } from '@/store/modules/map-store'
import { InfoWindow } from '../info-window/info-window'
import type { PointVo } from '@ghcloud/electronic-guide-service'
import { getAssetsFile } from '@/utils'
import { PointItem } from './point-item/point-item'
export const PointList = defineComponent({
  setup: () => {
    const clientStore = useClientStore()
    const emptyPng = getAssetsFile('empty.png')
    const state = reactive<{
      checkedInfo: PointVo ;
    }>({
      checkedInfo: {
        id: '',
        name: '',
        typeId: '',
        typeName: '',
        typeFilePath: '',
        areaId: '',
        areaName: '',
        address: '',
        coordinate: '',
        remarks: '',
        level: 0,
        state: '',
        filePath: ''
      }
    })
    const mapStore = useMapStore()
    const infoWindowRef = ref<InstanceType<typeof InfoWindow>>()
    onMounted(() => {
      setTimeout(() => {
        clientStore.getPointList()
      }, 100)
    })
    const haveNextPage = computed(() => {
      return clientStore.pointPage.pages > clientStore.pointSearchParams.pageNumber
    })
    const havePrevPage = computed(() => {
      return clientStore.pointSearchParams.pageNumber > 1
    })
    const handlePage = (page: number): void => {
      if (!haveNextPage.value && page > 0) {
        return
      }
      if (!havePrevPage.value && page < 0) {
        return
      }
      clientStore.pointSearchParams.pageNumber = clientStore.pointSearchParams.pageNumber + page
      clientStore.getPointList()
    }
    const handleCheckedPoint = (point: PointVo): void => {
      const lngLat = point.coordinate.split(',').reverse().map(item => +item) as [number, number]
      infoWindowRef.value && mapStore.getMapInstance.createInfoWindow(lngLat, infoWindowRef.value.$el)
      state.checkedInfo = point
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.list}>
          {
          !!clientStore.pointPage.records.length && clientStore.pointPage.records.map((item) => {
            return (
              <PointItem key={item.id} pointState={item} onChecked={handleCheckedPoint} />
            )
          })
          }
          {!clientStore.pointPage.records.length &&
            <div class={styles.empty}>
              <img class={styles.img} src={emptyPng} alt='' />
              <p class={styles.text}>暂无点位</p>
            </div>}
        </div>
        <div class={styles.page}>
          <div class={styles.total}>{clientStore.pointPage.total}条</div>
          <div class={styles.pagination}>
            <div class={[styles.item, havePrevPage.value && styles.active]} onClick={() => { handlePage(-1) }}>上一页</div>
            <div class={[styles.item, haveNextPage.value && styles.active]} onClick={() => { handlePage(1) }}>下一页</div>
          </div>
        </div>
        <div style={{ display: 'none' }}>
          <InfoWindow info={state.checkedInfo} ref={infoWindowRef} />
        </div>
      </div>
    )
  }
})
