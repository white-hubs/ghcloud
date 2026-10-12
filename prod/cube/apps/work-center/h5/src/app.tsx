import { createVNode, defineComponent, KeepAlive, onMounted, ref, Transition, type VNode } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
export const App = defineComponent({
  setup: () => {
    const theme = ref('lightBlue')
    onMounted(async () => {
      if (getEnvironment() === 'cubeApp') {
        try {
          theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
          cubeAppService.onVisibilityNativeAppBar(false)
        } catch {

        }
      }
    })
    return (): JSX.Element => (
      <>
        <ThemeConfigProvider theme={theme.value}>
          <RouterView>
            {
              ({ Component }: { Component: VNode; }) => {
                return (
                  <Transition name='van-fade'>
                    <KeepAlive include={['Entry']}>
                      {createVNode(Component)}
                    </KeepAlive>
                  </Transition>
                )
              }
            }
          </RouterView>
        </ThemeConfigProvider>
      </>
    )
  }
})
