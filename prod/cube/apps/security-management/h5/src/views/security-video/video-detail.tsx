import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import styles from './video-detail.module.less'
import { Cell, CellGroup, closeToast, showLoadingToast, showNotify } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { cubeDeviceCenterService } from '@/api/server'
import type { DeviceInstanceDetail } from '@ghcloud/cube-iot-center-service'
import { CubePlayer } from '@ghcloud/cube-player'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 监控详情 */
export const VideoDetail = defineComponent({
  setup: () => {
    document.title = '监控详情'
    const loading = ref(false)
    const router = useRouter()
    const { id } = useRoute().query as { id: string; }
    const device = ref<DeviceInstanceDetail>()
    try {
      cubeAppService.onVisibilityNativeAppBar(false)
    } catch {

    }
    onMounted(async () => {
      try {
        showLoadingToast('加载中')
        device.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: id })
      } catch {
        showNotify('加载失败')
        router.go(-1)
      } finally {
        closeToast()
      }
    })

    onBeforeUnmount(() => {
      // try {
      //   cubeAppService.onVisibilityNativeAppBar(true)
      // } catch {

      // }
    })
    return (): JSX.Element=>
      <>
        <CubeNavBar title='监控详情' />
        <div class={styles['video-detail']}>
          {
            !loading.value &&
            <>
              <CellGroup inset>
                <Cell title={device.value?.baseArchivesInfo.name} />
                <Cell
                  title=''
                  v-slots={{
                    label: () =>
                      <div>
                        <div>
                          <span>设备编码：</span>
                          <span>{device.value?.baseArchivesInfo.code}</span>
                        </div>
                        <div>
                          <span>设备品类：</span>
                          <span>{device.value?.productInfo.name ?? '--'}</span>
                        </div>
                        <div>
                          <span>维护部门：</span>
                          <span>{device.value?.baseArchivesInfo.department?.name ?? '--'}</span>
                        </div>
                        <div>
                          <span>所属区域：</span>
                          <span>{device.value?.baseArchivesInfo.area?.pathName ?? '--'}</span>
                        </div>
                      </div>
                  }}
                />
              </CellGroup>

              <CellGroup inset style='margin-top:2vw'>
                <Cell title='实时监控' />
                <Cell class={styles['camera-preview']}>
                  <CubePlayer
                    deviceId={id}
                    control={true}
                  />
                </Cell>
              </CellGroup>
            </>
          }
        </div>
      </>
  }
})
