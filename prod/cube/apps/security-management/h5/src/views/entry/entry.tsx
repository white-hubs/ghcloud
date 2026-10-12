import { defineComponent, onMounted, ref } from 'vue'
import styles from './entry.module.less'
import { showNotify } from 'vant'
import { EntryMenu, CubeNavBar, type AppRoutes } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
import { PatrolStatistics } from './cards/patrol-statistics/patrol-statistics'
import { SecurityMonitor } from './cards/security-monitor/security-monitor'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { cubeOuaaService } from '@/api/server'

/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const loading = ref(false)
    const userId = ref('')
    document.title = '安防监控'
    const getData = async (): Promise<void> => {
      try {
        // 获取用户ID
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
        loading.value = true
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 0)
      }
    }
    // 处理路由参数
    const handleRoutes = (): AppRoutes => {
      return routes.map(item => {
        if (item.path === '/') {
          return {
            ...item
          }
        }
        return {
          ...item,
          getQuery: async (): Promise<Record<string, string>> => {
            return { applicationCode: __ENV__.applicationCode, userId: userId.value, ...await item.getQuery?.() }
          }
        }
      })
    }
    onMounted(() => {
      getEnvironment() === 'cubeApp' && cubeAppService.onVisibilityNativeAppBar(false)
      getData()
    })

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='安防监控' />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode={__ENV__.applicationCode} routes={handleRoutes()} />
          <SecurityMonitor />
          <PatrolStatistics />
        </div>
      </>
  }
})
