import { onUnmounted, onMounted } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { EditCanvasTypeEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { titleInitConfig, menuBarInitConfig } from '@/setting/design-setting'

const chartEditStore = useChartEditStore()
// 初始化页面组件
export const initPageConfig = (): void => {
  const canvasStyle = chartEditStore.getCanvasScaleRect
  // 初始化菜单
  // 初始化菜单
  const menuWidth = ((canvasStyle.width - menuBarInitConfig.styles.width) / 2)
  menuBarInitConfig.styles.x = menuWidth
  menuBarInitConfig.styles.y = canvasStyle.height - menuBarInitConfig.styles.height - 10
  // 初始化头部
  titleInitConfig.styles.width = canvasStyle.width
  chartEditStore.setCurrentPageComponents([titleInitConfig, menuBarInitConfig])
}
// 布局处理
export const useLayout = (fn: () => Promise<void>): void => {
  /**
   * 初始化左右面板样式
   */
  type RemoveScaleType = () => void
  let removeScale: RemoveScaleType = (): void => {}
  onMounted(async () => {
    // 设置 Dom 值(ref 不生效先用 document)
    chartEditStore.setEditCanvas(
      EditCanvasTypeEnum.EDIT_LAYOUT_DOM,
      document.getElementById('go-chart-edit-layout')
    )
    chartEditStore.setEditCanvas(
      EditCanvasTypeEnum.EDIT_CONTENT_DOM,
      document.getElementById('go-chart-edit-content')
    )
    if (chartEditStore.pages.length === 0) {
      // chartEditStore.addPages({ title: '未命名页面1', initView: 'init-first' })
      initPageConfig()
    }
    // 获取数据
    await fn()
    // 监听初始化
    removeScale = chartEditStore.listenerScale()
  })

  onUnmounted(() => {
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.EDIT_LAYOUT_DOM, null)
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.EDIT_CONTENT_DOM, null)
    removeScale()
  })
}
