import { defineComponent, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
import { themeManager, antd3LegacyThemeManager } from './theme'
import './assets/style.less'
import { useFullScreen } from './hook/use-full-screen'

export const App = defineComponent({
  setup: () => {
    const { setScreenListener } = useFullScreen()
    onMounted(() => {
      themeManager.mount()
      antd3LegacyThemeManager.mount()
      themeManager.use('拂晓蓝')
      antd3LegacyThemeManager.use('拂晓蓝')
      setScreenListener()
    })

    return (): JSX.Element => (
      <ConfigProvider prefixCls='meet-room'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
