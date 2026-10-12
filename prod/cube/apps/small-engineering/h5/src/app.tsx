import { createVNode, defineComponent, type VNode, ref, onMounted, KeepAlive } from 'vue'
import { RouterView } from 'vue-router'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
import 'vant/lib/index.css'
import 'vant/es/notify/style'
import 'vant/es/toast/style'
import './app.less'

import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    onMounted(async () => {
      theme.value = getEnvironment() === 'cubeApp' ? await cubeAppService.getAppTheme() : 'lightBlue'
      await cubeAppService.onVisibilityNativeAppBar(false)
    })
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView>
          {
            ({ Component }: { Component: VNode; }) => {
              return (
                <KeepAlive include={['Entry']}>
                  {createVNode(Component)}
                </KeepAlive>
              )
            }
          }
        </RouterView>
      </ThemeConfigProvider>
    )
  }
})
