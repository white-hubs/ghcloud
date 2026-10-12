import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { createUuid } from '@/utils/index'
import { get2dModelById } from '@/apis'
const chartEditStore = useChartEditStore()
// * 拖拽到编辑区域里  todo: 添加进components拖拽方法需要优化
export const drop = async (e: DragEvent): Promise<boolean> => {
  e.preventDefault()
  if (!e.dataTransfer) return false
  // 获取拖拽数据
  const modelDataString = e.dataTransfer.getData('ueModel')
  const drayDataString = e.dataTransfer.getData('dragKey')
  const tdConfigString = e.dataTransfer.getData('tdConfig')
  // 添加组件
  if (drayDataString) {
    const drayData: CreateComponentType = JSON.parse(drayDataString)
    drayData.id = createUuid()
    if (drayData.components && drayData.components.length > 0) {
      drayData.components.forEach(x => {
        x.id = createUuid()
      })
    }
    drayData.styles.x = e.offsetX
    drayData.styles.y = e.offsetY
    if (!chartEditStore.getCurrentPage) return false
    if (!chartEditStore.getCurrentPage.components) return false
    chartEditStore.addComponentList(drayData)
    return false
  }
  if (!chartEditStore.getCurrentPage) return false
  if (chartEditStore.getCurrentPage.model ?? chartEditStore.getCurrentPageComponents.some(x => x.category === ComponentCategoryEnum.TDCONFIGURATION)) {
    return true
  }
  // 添加二维组态
  if (tdConfigString) {
    const tdConfigData = JSON.parse(tdConfigString)
    const { data } = await get2dModelById({ modelId: tdConfigData.id ?? '' })
    const handleTdConfigData: CreateComponentType = Object.assign({}, {
      id: tdConfigData.id,
      title: tdConfigData.name,
      category: ComponentCategoryEnum.TDCONFIGURATION,
      categoryName: '二维组态',
      key: 'td-configuation',
      components: null,
      styles: {
        show: true,
        x: 0,
        y: 0,
        isFullScreen: true,
        width: 1920,
        height: 1080,
        zIndex: 100
      },
      config: {
        nav: data
      }
    })
    // handleTdConfigData.styles.x = e.offsetX
    // handleTdConfigData.styles.y = e.offsetY
    if (!chartEditStore.getCurrentPage) return false
    if (!chartEditStore.getCurrentPage.components) return false
    chartEditStore.addComponentList(handleTdConfigData)
    return false
  }
  // 添加模型
  if (modelDataString) {
    const modelData = JSON.parse(modelDataString)
    const handleModelData: CreateComponentType = Object.assign({}, {
      id: modelData.id,
      title: modelData.name,
      category: ComponentCategoryEnum.MODEL,
      categoryName: '模型',
      key: 'ue5-model',
      components: null,
      config: {
        address: modelData.address
      },
      styles: {
        show: true,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        isFullScreen: true,
      }
    })
    chartEditStore.setCurrentPageModel(handleModelData)
  } else {
    chartEditStore.setCurrentPageModel(null)
  }
  return false
}

// * 进入拖拽区域
export const dragoverHandle = (e: DragEvent): void => {
  e.preventDefault()
  e.stopPropagation()
}
