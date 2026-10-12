import { useRoute } from 'vue-router'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { onMounted, watch } from 'vue'

export const useMetaTitle = (): void => {
  const route = useRoute()
  const { meta } = route
  const title = meta.title as string

  const setTitle = async () => {
    // 检查是否在微信小程序环境中
    const isWxEnv = await cubeWxService.getWxEnv()
    
    if (isWxEnv) {
      try {
        // 使用postMessage向小程序发送设置标题的消息
        cubeWxService.postMessage({
          action: 'setNavigationBarTitle',
          title: title,
          routeTitle: title // 添加路由标题信息
        }, false)
        
        // 同时通过URL参数传递路由标题
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('routeTitle', title)
        history.replaceState(null, '', currentUrl.toString())
        
        document.title = title
      } catch (error) {
        document.title = title
      }
    } else {
      document.title = title
    }
  }

  onMounted(() => {
    setTitle()
  })

  // 监听路由变化，确保在路由切换时也能正确设置标题
  watch(() => route.fullPath, () => {
    setTimeout(() => {
      setTitle()
    }, 300)
  })
}
