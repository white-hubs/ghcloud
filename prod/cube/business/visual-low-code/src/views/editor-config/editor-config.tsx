import { defineComponent, onMounted } from 'vue'
import { EditLayout } from '@/components/common/layout/layout'
import SourceMaterial from './components/source-material'
import Nav from './components/nav-model/nav'
import { ConfigContent } from './components/config-content'
import { LayoutHeader } from '@/components/common/layout/layout-header'
import { RightSider } from '@/components/common/layout/right-sider'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { getSessionStorage, StorageEmun } from '@/utils/storage'
import { getCanvasConfigInfo } from '@/apis'
import type { ShareDataType } from '@/store/modules/chart-edit-store/chart-edit-store.d'

const chartEditStore = useChartEditStore()
export const EditorConfig = defineComponent({
  setup: () => {
    const layoutSlots = {
      'layout-header': () => <LayoutHeader />,
      'left-sider': () => <div><Nav /> <SourceMaterial /></div>,
      'right-sider': () => <RightSider />,
      'layout-content': () => <ConfigContent />,
    }
    onMounted(async () => {
      const projectId = getSessionStorage(StorageEmun.PROJECTID) as string
      const instanceId = getSessionStorage(StorageEmun.INSTANCEID) as string
      try {
        const result = await getCanvasConfigInfo({ projectId, instanceId })
        const editorSource = result.data
        chartEditStore.setProjectName(editorSource.projectData.projectName)
        const canvasJson = JSON.parse(editorSource.canvasJson)
        if (!Object.keys(canvasJson).length) return
        chartEditStore.setActivePage(canvasJson.pages[0].id)
        chartEditStore.setPages(canvasJson.pages)
        // 设置shareData
        const shareData: ShareDataType[] = []
        chartEditStore.getAllComponents.forEach(comp => {
          if (comp.attr?.isShareData && !comp.attr?.sourceShareDataId) {
            const len = chartEditStore.getAllComponents.filter(x => x.attr?.sourceShareDataId === comp.id).length
            shareData.push({ id: comp.id, data: comp, quoteNum: len, currentItemId: '' })
          }
        })
        chartEditStore.setShareData(shareData)
      } catch (error) {
        // (function(){})(error)
      }
    })

    return () => (
      <>
        <EditLayout v-slots={layoutSlots} />
      </>
    )
  },
})
