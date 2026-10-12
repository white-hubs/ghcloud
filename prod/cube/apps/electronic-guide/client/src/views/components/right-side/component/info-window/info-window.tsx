import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import type { PointVo } from '@ghcloud/electronic-guide-service'
import { getAssetsFile } from '@/utils'
import { useMapStore } from '@/store/modules/map-store'
export const InfoWindow = defineComponent({
  props: {
    info: {
      type: Object as PropType<PointVo>,
      default: () => {
        return {}
      }
    }
  },
  setup: (props) => {
    const defaultMerchant = getAssetsFile('default-merchant.png')
    const closeIcon = getAssetsFile('close.png')
    const mapStore = useMapStore()
    const handleNav = (): void => {
      const lngLat = props.info.coordinate.split(',').reverse().map(item => +item) as [number, number]
      mapStore.getMapInstance.clearWalkPlan()
      mapStore.getMapInstance.closeInfoWindow()
      // TODO:导航
      mapStore.getMapInstance.routeWalkPlan(lngLat)
    }

    const areaIcon = getAssetsFile('area-icon.png')
    const localIcon = getAssetsFile('local-icon.png')
    const navIcon = getAssetsFile('nav-icon.png')
    return (): JSX.Element => (
      <div class={styles.container}>
        <img class={styles.closeIcon} onClick={() => { mapStore.getMapInstance.closeInfoWindow() }} src={closeIcon} alt='' srcset='' />
        <div class={styles.top}>
          <img src={props.info.filePath || defaultMerchant} alt='' srcset='' />
          <div class={styles.topContent}>
            <div class={styles.name}>{props.info.name}</div>
            <div class={styles.type}>{props.info.typeName}</div>
            <div class={styles.area}>
              <img src={areaIcon} alt='' srcset='' />
              <span>{props.info.areaName}</span>
            </div>
            <div class={styles.local}>
              <img src={localIcon} alt='' srcset='' />
              <span>{props.info.address}</span>
            </div>
          </div>
          <div class={styles.navButton} onClick={handleNav}>
            <img class={styles.navIcon} src={navIcon} alt='' srcset='' />
            <span>到这去</span>
          </div>
        </div>
        {props.info.remarks &&
          <div class={styles.desc}>
            {props.info.remarks}
          </div>}

      </div>
    )
  }
})
