import { defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
import { themeManager, antd3LegacyThemeManager } from './theme'
import './assets/style.less'
import { useFullScreen } from './hook/use-full-screen'
import { mqttDisposed } from './hook/use-props'
import { useUpdateVersion } from './hook/use-update-version.ts'

export const App = defineComponent({
  setup: () => {
    const { setScreenListener } = useFullScreen()
    const { updateVersion, clearTimer } = useUpdateVersion()

    onMounted(() => {
      themeManager.mount()
      antd3LegacyThemeManager.mount()
      themeManager.use('拂晓蓝')
      antd3LegacyThemeManager.use('拂晓蓝')
      setScreenListener()
      updateVersion()
    })

    onBeforeUnmount(() => {
      clearTimer()
      mqttDisposed()
    })

    return (): JSX.Element => (
      <ConfigProvider prefixCls='operating-room'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
