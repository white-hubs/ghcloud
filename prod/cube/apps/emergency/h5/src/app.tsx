import { createVNode, defineComponent, type VNode, Transition, ref, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
import 'vant/lib/index.css'
import 'vant/es/notify/style'
import 'vant/es/toast/style'
import './app.less'

import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
export const App = defineComponent({
  setup: () => {
    const route = useRoute()
    const theme = ref('')
    onMounted(async () => {
      theme.value = getEnvironment() === 'cubeApp' ? await cubeAppService.getAppTheme() : 'lightBlue'
      cubeAppService.onVisibilityNativeAppBar(false)
    })
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView v-slots={{
          default: ({ Component }: { Component: VNode; }) => {
            return (
              <Transition name='fade' mode='in-out'>
                <div key={route.path} style={{ height: '100%' }}>
                  {createVNode(Component)}
                </div>
              </Transition>
            )
          }
        }}
        />
      </ThemeConfigProvider>
    )
  }
})
