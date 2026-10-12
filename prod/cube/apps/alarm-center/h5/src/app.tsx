import { createVNode, defineComponent, type VNode, Transition, ref, onMounted, KeepAlive } from 'vue'
import { RouterView } from 'vue-router'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
import 'vant/lib/index.css'
import 'vant/es/notify/style'
import 'vant/es/toast/style'
import './app.less'
import { useGlobalRouter } from './hook/use-global-router'

import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
export const App = defineComponent({
  setup: () => {
    const { route } = useGlobalRouter()
    const theme = ref('')
    onMounted(async () => {
      getEnvironment() === 'cubeApp' && cubeAppService.onVisibilityNativeAppBar(false)
      theme.value = getEnvironment() === 'cubeApp' ? await cubeAppService.getAppTheme() : 'lightBlue'
    })
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView v-slots={{
          default: ({ Component }: { Component: VNode; }) => {
            return (
              <Transition name='fade' mode='in-out'>
                <KeepAlive include={['Entry']}>
                  <div key={route.path} style={{ height: '100%' }}>
                    {createVNode(Component)}
                  </div>
                </KeepAlive>
              </Transition>
            )
          }
        }}
        />
      </ThemeConfigProvider>
    )
  }
})
