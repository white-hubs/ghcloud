import { defineComponent, onMounted } from 'vue'
import { ConfigProvider } from '@ghcloud/cube-ui'
import DefaultTheme from 'vitepress/theme'
import { antd3LegacyThemeManager, themeManager } from '@ghcloud/cube-theme'
import NotFoundPage from '../404/404'

export const Layout = defineComponent({
  setup: () => {
    onMounted(() => {
      themeManager.mount()
      themeManager.use('开河蓝')
      antd3LegacyThemeManager.mount()
      antd3LegacyThemeManager.use('开河蓝')
    })
    return (): JSX.Element=> (
      <ConfigProvider prefixCls='cube-docs'>
        <DefaultTheme.Layout v-slots={{
          'not-found': () => <NotFoundPage />,
        }}
        />
      </ConfigProvider>
    )
  }
})
