import { defineComponent, ref, onMounted, KeepAlive, type VNode, createVNode, Transition } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'

export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    onMounted(async () => {
      theme.value = getEnvironment() === 'cubeApp' ? await cubeAppService.getAppTheme() : 'lightBlue'
    })
    return () => (
      <RouterView>
        {
          ({ Component }: { Component: VNode; }) => {
            return (
              <Transition name='van-fade'>
                <KeepAlive include={['Entry', 'SecurityVideo']}>
                  {createVNode(Component)}
                </KeepAlive>
              </Transition>
            )
          }
        }
      </RouterView>
    )
  }
})
