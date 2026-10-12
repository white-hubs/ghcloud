import { defineComponent, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    onMounted(async () => {
      theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
    })
    cubeAppService.onVisibilityNativeAppBar(true)
    return () => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView />
      </ThemeConfigProvider>
    )
  }
})
