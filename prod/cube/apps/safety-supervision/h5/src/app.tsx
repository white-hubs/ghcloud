import { defineComponent, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
import 'vue3-hash-calendar/es/index.css'
import '../assets/font/index.css'
import { storeMarket } from './store/market'

export const App = defineComponent({
  setup: () => {
    const piniaStoreMarket = storeMarket()
    window.receiveMessage = (message: { data: string; }): void => {
      if (message.data === null) {
        piniaStoreMarket.currentMarketName = ''
        piniaStoreMarket.currentMarket = ''
      } else {
        const { marketName, marketTenant } = JSON.parse(message.data)
        piniaStoreMarket.currentMarketName = marketName
        piniaStoreMarket.currentMarket = marketTenant
      }
    }
    const theme = ref('')
    onMounted(async () => {
      theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
    })
    try {
      cubeAppService.onVisibilityNativeAppBar(true)
    } catch {

    }
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        <RouterView />
      </ThemeConfigProvider>
    )
  }
})
