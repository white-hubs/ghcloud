import { defineComponent } from 'vue'
import styles from './index.module.less'
import { getAssetsFile } from '@/utils'
import { useMapStore } from '@/store/modules/map-store'
export const LeftFooter = defineComponent({
  setup: () => {
    const focusIcon = getAssetsFile('focus.png')
    // const amplifyIcon = getAssetsFile('amplify.png')
    // const lowerIcon = getAssetsFile('lower.png')
    const mapStore = useMapStore()
    // const handleSetMapZoom = (type: 'add' | 'reduce'): void => {
    //   const currentZoom = mapStore.getMapInstance.getZoom()
    //   if (type === 'add') {
    //     mapStore.getMapInstance.setZoom(currentZoom + 0.5)
    //   } else {
    //     mapStore.getMapInstance.setZoom(currentZoom - 0.5)
    //   }
    // }
    return (): JSX.Element => (
      <div class={styles.container}>
        <div
          class={styles.item} onClick={() => {
            mapStore.getMapInstance.resetMap()
          }}
        >
          <img src={focusIcon} alt='' srcset='' />
          <div>我的位置</div>
        </div>
        {/* <div class={styles.item} onClick={() => { handleSetMapZoom('add') }}>
          <img src={amplifyIcon} alt='' srcset='' />
          <div>放大</div>
        </div>
        <div class={styles.item} onClick={() => { handleSetMapZoom('reduce') }}>
          <img src={lowerIcon} alt='' srcset='' />
          <div>缩小</div>
        </div> */}
      </div>
    )
  }
})
