import { createVNode, defineComponent, KeepAlive, onMounted, ref, Transition, type VNode } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'

export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    onMounted(async () => {
      cubeAppService.onVisibilityNativeAppBar(false)
      theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
    })
    return (): JSX.Element => (
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
    )
  }
})
