import { defineComponent, onMounted, shallowRef } from 'vue'
import styles from './index.module.less'
import { CustomAMap, mapOptions } from '@/plugin/map-plugin'
import { useMapStore } from '@/store/modules/map-store'
export const MapContainer = defineComponent({
  setup: () => {
    const mapStore = useMapStore()
    // const map: SingleAMap | null = null
    const mapInstance = shallowRef()
    const initMap = (): void => {
      mapOptions.center = [30.564748, 104.020356]
      mapOptions.zoom = 20
      mapOptions.mapContainerId = 'map-container'
      mapInstance.value = new CustomAMap(mapOptions)
      mapStore.setMapInstance(mapInstance.value)
    }
    onMounted(() => {
      initMap()
    })
    return (): JSX.Element => (
      <div class={[styles.container]} id='map-container' />
    )
  }
})
