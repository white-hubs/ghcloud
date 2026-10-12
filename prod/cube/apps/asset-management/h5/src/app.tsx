import { createVNode, defineComponent, KeepAlive, onMounted, ref, Transition, type VNode } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      (
        document.addEventListener(
          'blur',
          event => {
          // 当页面没出现滚动条时才执行，因为有滚动条时，不会出现这问题
          // input textarea 标签才执行，因为 a 等标签也会触发 blur 事件
            if (
              document.documentElement.offsetHeight <=
                document.documentElement.clientHeight &&
                ['input', 'textarea'].includes((event.target as HTMLElement)?.localName)
            ) {
              setTimeout(function () {
                document.body.scrollIntoView() // 回顶部
              }, 100)
            }
          },
          true
        )
      )
    }
    onMounted(async () => {
      try {
        theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
        cubeAppService.onVisibilityNativeAppBar(false)
      } catch {

      }
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
