import { defineComponent, onMounted, ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import 'vant/lib/index.css'
import { cubeAppService, cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
import { storeKill } from './store/kill'
import { Icon } from 'vant'

const backButtonStyle = {
  position: 'fixed',
  top: '4px',
  left: '4px',
  zIndex: 100,
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,04,04,.45)',
  // backgroundColor: 'rgba(109,134,212,1)',
  // backgroundColor: 'rgba(231,237,255,0.85)',
  borderRadius: '50%',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
  border: '1px solid rgba(231,237,255,0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}

export const App = defineComponent({
  setup: () => {
    const theme = ref('')
    const killStore = storeKill()
    const route = useRoute()
    const router = useRouter()
    const isWxEnv = ref(false)
    
    // 不需要显示返回按钮的路由列表
    const notNavRoutes = [
      '/device',
      '/command',
      '/group',
      '/log',
    ]
    
    const showBackButton = computed(() => {
      const currentPath = route.path
      // return isWxEnv.value && navRoutes.some(path => 
      return !notNavRoutes.some(path => 
        currentPath === path
      )
    })
    
    const handleBack = () => {
      router.back()
    }
    
    onMounted(async () => {
      if (getEnvironment() === 'cubeApp') {
        theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
        cubeAppService.onVisibilityNativeAppBar(false)
      }
      
      // 检查是否在微信环境
      isWxEnv.value = await cubeWxService.getWxEnv()
      
      // 进入应用后自动更新分组信息
      await killStore.updateGroupInfo()
    })
    
    return (): JSX.Element => (
      <ThemeConfigProvider theme={theme.value}>
        {showBackButton.value && (
          <div style={backButtonStyle} onClick={handleBack}>
            <Icon name="arrow-left" size="20" color="#fff" />
          </div>
        )}
        <RouterView />
      </ThemeConfigProvider>
    )
  }
})
