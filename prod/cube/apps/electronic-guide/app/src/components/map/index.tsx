import { defineComponent, onMounted, onUnmounted, watch, type PropType } from 'vue'
import { logger } from '@/logger'
import { CustomAMap } from '@/plugin/custom-a-map'
import styles from './index.module.less'
export interface LayerInfo {
  southwest: string;
  northeast: string;
  center: string;
  layerFile: string;
}
export const Map = defineComponent({
  props: {
    id: {
      type: String,
      default: () => 'map'
    },
    pointMap: {
      type: Object as PropType<Record<string, string>>,
      default: () => ''
    },
    value: {
      type: String,
      default: () => ''
    },
    center: {
      type: String,
      default: () => '30.564748, 104.020356'
    },
    zoom: {
      type: String,
      default: () => '14'
    },
    layerInfo: {
      type: Object as PropType<LayerInfo>,
      default: () => {
        return {
          southwest: '',
          northeast: '',
          center: '',
          layerFile: ''
        }
      }
    }

  },
  emits: ['clickMap'],
  setup: (props, { expose, emit }) => {
    let mapInstance: CustomAMap | null = null
    let pointPosition = ''
    const initTencentMap = async (): Promise<void> => {
      const centerString = props.center ? props.center : '30.564748, 104.020356'
      const zoom = +props.zoom ? +props.zoom : 15
      const center = centerString.split(',').map(item => +item)
      mapInstance = new CustomAMap(center, zoom, props.id)
      mapInstance.on('clickMap', (data) => {
        const res = data as { lat: number; lng: number; }
        pointPosition = `${res.lat},${res.lng}`
        emit('clickMap', pointPosition)
      })
    }
    const addMark = (type: string, point: string): void => {
      const [lat, lng] = point.split(',').map(Number)
      mapInstance?.addMarkByType(type, lat, lng)
    }
    watch(() => props.pointMap,
      () => {
        if (Object.keys(props.pointMap).length) {
          if (mapInstance?.mapInstance) {
            for (const key in props.pointMap) {
              const point = props.pointMap[key]
              if (!point) return
              const [lat, lng] = point.split(',').map(Number)
              if (!lat || !lng) return
              mapInstance?.addMarkByType(key, lat, lng)
            }
          } else {
            setTimeout(() => {
              for (const key in props.pointMap) {
                const point = props.pointMap[key]
                if (!point) return
                const [lat, lng] = point.split(',').map(Number)
                if (!lat || !lng) return
                mapInstance?.addMarkByType(key, lat, lng)
              }
            }, 1500)
          }
        }
      }, { immediate: true })
    watch(() => [props.layerInfo, props.center, props.zoom], () => {
      if (mapInstance?.mapInstance) {
        if (props.center) {
          const centerString = props.center ? props.center : '30.564616,104.020175'
          const centerLat = Number(centerString.split(',')[0])
          const centerLng = Number(centerString.split(',')[1])
          mapInstance?.setCenter(centerLat, centerLng)
        }
        if (props.zoom) {
          mapInstance?.setZoom(+props.zoom)
        }
        if (props.layerInfo?.center) {
          loadLayer()
        }
      } else {
        setTimeout(async () => {
          if (props.center) {
            const centerString = props.center ? props.center : '30.564616,104.020175'
            const centerLat = Number(centerString.split(',')[0])
            const centerLng = Number(centerString.split(',')[1])
            mapInstance?.setCenter(centerLat, centerLng)
          }
          if (props.zoom) {
            mapInstance?.setZoom(+props.zoom)
          }
          if (props.layerInfo?.center) {
            loadLayer()
          }
        }, 1500)
      }
    }, { immediate: true })
    const loadLayer = async (): Promise<void> => {
      // if (!data) return
      mapInstance?.setMapImageLayer(
        {
          southwest: props.layerInfo.southwest,
          northeast: props.layerInfo.northeast,
          center: props.layerInfo.center,
          layerFile: props.layerInfo.layerFile
        }
      )
    }
    const getPoint = (): string => {
      return pointPosition
    }
    const getZoom = (): unknown => {
      return mapInstance?.getZoom()
    }
    onMounted(async () => {
      await initTencentMap()
    })
    onUnmounted(() => {
      logger.info('onUnmounted', mapInstance)
      mapInstance?.destroyMap()
      mapInstance = null
    })
    expose({
      getPoint,
      addMark,
      getZoom
    })
    return (): JSX.Element => (
      <div id={props.id} class={styles.map} style={{ height: '100%', zIndex: 1 }} />
    )
  }
})
