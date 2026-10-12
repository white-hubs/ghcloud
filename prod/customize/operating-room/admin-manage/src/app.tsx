import { defineComponent, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
import { themeManager, antd3LegacyThemeManager } from './theme'

export const App = defineComponent({
  setup: () => {
    onMounted(() => {
      themeManager.mount()
      antd3LegacyThemeManager.mount()
      themeManager.use('拂晓蓝')
      antd3LegacyThemeManager.use('拂晓蓝')
    })
    return (): JSX.Element => (
      <ConfigProvider prefixCls='operating-room-admin-manage'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
