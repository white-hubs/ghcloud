import { defineComponent, ref } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import styles from './ue5-model.module.less'
import UeClient from '@/static/model/ue-client'
import type { CameraViewType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
export default defineComponent({
  name: 'page-title',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const location = ref<{ x: number; y: number; z: number; }>()
    const rotation = ref<{ pitch: number;roll: number;yaw: number; }>()
    const handleVisualAngle = (): void => {
      const ueClient = UeClient.getInstance()
      // 获取视角
      ueClient.send('getCameraView', function (cameraView: CameraViewType) {
        if (cameraView.location) { location.value = cameraView.location }
        if (cameraView.rotation) { rotation.value = cameraView.rotation }
        // 设置视角
        ueClient.send('setCameraView', cameraView)
        if (chartEditStore.getCurrentPage?.model)chartEditStore.getCurrentPage.model.config.cameraView = cameraView
      })
    }
    return () => (
      <div style={{ margin: '10px' }}>
        <p>默认视角: <a onClick={handleVisualAngle}>获取当前视角更新参数</a></p>
        <div class={styles['visual-angle']}>
          <div class={styles.row}>
            <div>相机位置</div>
            <div>
              {
                location.value
                  ? <div><p>x:{location.value.x}</p><p>y:{location.value.y}</p><p>z:{location.value.z}</p></div>
                  : <span>-</span>
              }
            </div>
          </div>
          <div class={styles.row}>
            <div>相机角度</div>
            <div>
              {
                rotation.value
                  ? <div><p>rotation:{rotation.value.pitch}</p><p>roll:{rotation.value.roll}</p><p>yaw:{rotation.value.yaw}</p></div>
                  : <span>-</span>
              }
            </div>
          </div>
        </div>
      </div>
    )
  },
})
