import { defineComponent, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    onMounted(async () => {
      if (getEnvironment() === 'cubeApp') {
        theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
        cubeAppService.onVisibilityNativeAppBar(false)
      }
    })
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView />
      </ThemeConfigProvider>
    )
  }
})
