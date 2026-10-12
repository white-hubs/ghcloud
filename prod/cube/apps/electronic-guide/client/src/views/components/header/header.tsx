import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { CountTime } from './count-time/count-time'
import { Modal, Select, Form, FormItem, message, Button, LineOutlined, CloseOutlined } from '@ghcloud/cube-ui'
import { deviceService } from '@/apis/service'
import type { GuideDeviceVo } from '@ghcloud/electronic-guide-service'
import { useMapStore } from '@/store/modules/map-store'
import { useClientStore } from '@/store/modules/client-store'
export const Header = defineComponent({
  setup: () => {
    const mapStore = useMapStore()
    const clientStore = useClientStore()
    const state = reactive<
      {
        visible: boolean;
        isFullScreen: boolean;
        device: string;
        deviceOptions: GuideDeviceVo[];
      }
    >({
      visible: false,
      isFullScreen: false,
      device: '',
      deviceOptions: []
    })
    let count = 0
    let lastTime = 0
    const handleClick = (): void => {
      const currentTime = new Date().getTime()
      count = (currentTime - lastTime) < 300 ? count + 1 : 0
      lastTime = new Date().getTime()
      if (count >= 2) {
        state.visible = true
      }
    }
    const getDeviceList = async (): Promise<void> => {
      const result = await deviceService.getDeviceList()
      state.deviceOptions = result.records
      state.device = result.records[0]?.id ?? ''
    }
    const handleOk = (): void => {
      if (!state.device) {
        message.error('请选择设备')
        return
      }
      const device = state.deviceOptions.find(item => item.id === state.device)
      const location = device?.coordinate.split(',').map(item => +item) as [number, number]
      clientStore.systemInfo = {
        name: device?.title ?? '',
        logo: device?.logo ?? '',
      }
      mapStore.getMapInstance.setCurrentLocation({
        center: location,
        zoom: device ? +device.zoom : 15
      })
      if (!mapStore.getMapInstance.mapInstance) {
        setTimeout(() => {
          mapStore.getMapInstance.addCurrentPositionMarker(location)
        }, 1500)
      } else {
        mapStore.getMapInstance.addCurrentPositionMarker(location)
      }
      state.visible = false
    }
    const postMessageForParent = (type: 'close-app' | 'minimize-app'): void => {
      if (type === 'close-app') {
        window.WebShellJsBridge.closeApp()
      } else {
        window.WebShellJsBridge.goHome()
      }
    }
    const setFullScreen = (): void => {
      const element = document.documentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
        state.isFullScreen = true
        return
      }
      // @ts-expect-error
      if (element.webkitRequestFullScreen) {
        // @ts-expect-error
        element.webkitRequestFullScreen()
        state.isFullScreen = true
        return
      }
      // @ts-expect-error
      if (element.mozRequestFullScreen) {
        // @ts-expect-error
        element.mozRequestFullScreen()
        state.isFullScreen = true
        return
      }
      // @ts-expect-error
      if (element.msRequestFullscreen) {
        // @ts-expect-error
        element.msRequestFullscreen()
        state.isFullScreen = true
      }
      // 判断是否已经是全屏
    }
    const cancelFullScreen = (): void => {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        state.isFullScreen = false
      // @ts-expect-error
      } else if (document.mozCancelFullScreen) {
        // @ts-expect-error
        document.mozCancelFullScreen()
        state.isFullScreen = false
      // @ts-expect-error
      } else if (document.webkitExitFullscreen) {
        // @ts-expect-error
        document.webkitExitFullscreen()
        state.isFullScreen = false
      }
    }
    onMounted(async () => {
      await getDeviceList()
      handleOk()
    })
    return () => (
      <div class={styles.container}>
        <div class={styles.logo}>
          <img src={clientStore.systemInfo.logo} alt='' onClick={handleClick} />
          <div>{clientStore.systemInfo.name}</div>
        </div>
        <CountTime />
        <Modal onOk={handleOk} v-model:visible={state.visible} title='设置导览设备'>
          <Form size='large'>
            <FormItem label='应用设置'>
              <div style={{ display: 'flex', gap: '12px' }}>
                {
                  !!(!state.isFullScreen && !window.WebShellJsBridge) &&
                    <Button
                      onClick={setFullScreen}
                      type='primary'
                    >设置全屏
                    </Button>
                }
                {
                  !!(state.isFullScreen && !window.WebShellJsBridge) &&
                    <Button
                      onClick={cancelFullScreen}
                      type='primary'
                    >取消全屏
                    </Button>
                }
                {window.WebShellJsBridge &&
                  <Button
                    onClick={() => { postMessageForParent('minimize-app') }}
                    type='primary' v-slots={{
                      icon: () => <LineOutlined />,
                    }}
                  >最小化
                  </Button>}
                {window.WebShellJsBridge &&
                  <Button
                    onClick={() => { postMessageForParent('close-app') }}
                    type='primary' v-slots={{
                      icon: () => <CloseOutlined />,
                    }}
                  >关闭
                  </Button>}
              </div>

            </FormItem>
            <FormItem label='导览设备'>
              <Select v-model:value={state.device} fieldNames={{ label: 'name', value: 'id' }} options={state.deviceOptions} />
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
})
