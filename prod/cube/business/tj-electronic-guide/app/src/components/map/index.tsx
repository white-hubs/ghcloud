import { defineComponent, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { logger } from '@/logger'
import { getUsingLayerDetails } from '@/apis/layer-manage'
import styles from './index.module.less'
export const Map = defineComponent({
  props: {
    id: {
      type: String,
      default: () => 'map'
    },
    value: {
      type: String,
      default: () => ''
    },
    center: {
      type: String,
      default: () => '38.964929,116.989435'
    },
    zoom: {
      type: String,
      default: () => '14'
    },
    loadLayer: {
      type: Boolean,
      default: () => false
    }

  },
  setup: (props, { expose }) => {
    const tencentMap = (window as any).TMap
    let map: any = null
    let pointPosition = ''
    let markerLayer: any = null
    let setLayer = false
    const initTencentMap = (): void => {
      const centerString = props.center ? props.center : '38.964929,116.989435'
      const zoomString = props.zoom ? props.zoom : '15'
      const centerLat = Number(centerString.split(',')[0])
      const centerLng = Number(centerString.split(',')[1])
      const center = new tencentMap.LatLng(centerLat, centerLng)
      const mapContainer = document.getElementById(props.id)
      map = new tencentMap.Map(mapContainer, {
        center, // 设置地图中心点坐标
        zoom: zoomString, // 设置地图缩放级别
        viewMode: '2D',
        disableDefaultUI: true, // 平移控件的初始启用/停用状态。
      })
      markerLayer = new tencentMap.MultiMarker({
        id: 'marker-layer',
        map
      })
      map.on('click', (evt: { latLng: unknown; }) => {
        logger.info(evt.latLng)
        markerLayer.setGeometries([])
        markerLayer.add({
          position: evt.latLng
        })
        const latLng = evt.latLng as { lat: number; lng: number; }
        pointPosition = `${latLng.lat},${latLng.lng}`
      })
      logger.info(map)
    }
    watch(() => props.value,
      () => {
        if (props.value) {
          nextTick(() => {
            pointPosition = props.value
            const [lat, lng] = props.value.split(',').map(Number)
            markerLayer.add([{
              position: {
                height: 0,
                lat,
                lng
              }
            }])
          })
        }
      }, { immediate: true })
    watch(() => [props.loadLayer, props.center, props.zoom], () => {
      nextTick(async () => {
        if (props.center) {
          const centerString = props.center ? props.center : '30.564616,104.020175'
          const centerLat = Number(centerString.split(',')[0])
          const centerLng = Number(centerString.split(',')[1])
          const centerLatLng = new tencentMap.LatLng(centerLat, centerLng)
          map.setCenter(centerLatLng)
        }
        if (props.zoom) {
          map.setZoom(props.zoom)
        }
        if (props.loadLayer && !setLayer) {
          await loadLayer()
        }
      })
    }, { immediate: true })
    const loadLayer = async (): Promise<void> => {
      const { data } = await getUsingLayerDetails()
      if (!data) return
      const swLatLng = data.southwest.split(',')
      const neLatLng = data.northeast.split(',')
      const imageSW = new tencentMap.LatLng(swLatLng[0], swLatLng[1])
      const imageNE = new tencentMap.LatLng(neLatLng[0], neLatLng[1])
      const centerLat = Number(data.center.split(',')[0])
      const centerLng = Number(data.center.split(',')[1])
      const centerLatLng = new tencentMap.LatLng(centerLat, centerLng)
      map.setCenter(centerLatLng)
      const imageLatLngBounds = new tencentMap.LatLngBounds(imageSW, imageNE) // 根据拟覆盖范围的西南角与东北角新建LatLngBounds对象
      const imageGroundLayer = new tencentMap.ImageGroundLayer({
        bounds: imageLatLngBounds,
        src: data.layerFile, // 拟覆盖图片的URL
        map,
      })
      map.setBaseMap({
        type: 'vector',
        features: ['base', 'label'],
      })
      logger.info(imageGroundLayer, '1212')
      setLayer = true
    }
    const getPoint = (): string => {
      return pointPosition
    }
    const getZoom = (): unknown => {
      return map.getZoom()
    }
    onMounted(() => {
      initTencentMap()
    })
    onUnmounted(() => {
      logger.info('onUnmounted', map)
      map.destroy()
    })
    expose({
      getPoint,
      getZoom
    })
    return () => (
      <div id={props.id} class={styles.map} style={{ height: '400px' }} />
    )
  }
})
