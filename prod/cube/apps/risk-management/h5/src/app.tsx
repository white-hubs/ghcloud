import { defineComponent, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'

import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
export const App = defineComponent({
  setup: () => {
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
    const theme = ref('')
    onMounted(async () => {
      theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
      cubeAppService.onVisibilityNativeAppBar(false)
    })
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView />
      </ThemeConfigProvider>
    )
  }
})
