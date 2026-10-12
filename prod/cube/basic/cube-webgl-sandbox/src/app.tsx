import { defineComponent, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
import { themeManager, antd3LegacyThemeManager } from '@ghcloud/cube-theme'

export const App = defineComponent({
  setup: () => {
    onMounted(() => {
      themeManager.use("开河蓝");
      antd3LegacyThemeManager.use("开河蓝");
    })
    return (): JSX.Element => (
      <ConfigProvider prefixCls='cube-webgl-viewer'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
