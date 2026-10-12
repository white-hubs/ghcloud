import { defineComponent, onMounted, type VNode } from 'vue'
import { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { getTenantInfo } from '@/api/ouaa'
import { authStore } from '@/api/auth-store'

export const Map = defineComponent({
  emits: ['click'],
  setup: (props, { emit }) => {
    const cubeMap = new CubeMapLeaflet(authStore)
    onMounted(async () => {
      const res = await getTenantInfo(authStore.tenant)
      let lnglat: [number, number] | null = null
      await cubeMap.renderMap('map')
      if (res.data.lntAndLat) {
        lnglat = res.data.lntAndLat.split(',').reverse().map(e => Number(e)) as [number, number]
        cubeMap.setCenter(Number(lnglat[0]), Number(lnglat[1]))
        cubeMap.addMarker({
          position: {
            lng: lnglat[0],
            lat: lnglat[1]
          }
        })
      }
      cubeMap.onMapClick = async (event): Promise<void> => {
        cubeMap.clearMap()
        cubeMap.setCenter(event.lng, event.lat)
        cubeMap.addMarker({
          position: {
            lng: event.lng,
            lat: event.lat
          }
        })
        const addressInfo = await cubeMap.getAddressByLntLat(event.lng, event.lat)
        emit('click', { lng: event.lng, lat: event.lat, address: addressInfo.address })
      }
      cubeMap.registerMapClickEvent()
    })

    return (): VNode => <div id='map' style='width: 100%;height: 450px;' />
  }
})
