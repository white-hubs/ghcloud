import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { EditCanvasTypeEnum, type CreateComponentType, type UeModel } from '@/store/modules/chart-edit-store/chart-edit-store.d'
const chartEditStore = useChartEditStore()
interface DragType { dragstart: (e: DragEvent, component: CreateComponentType) => void; dragend: () => void;dragStartModel: (e: DragEvent, item: UeModel) => void; }
export function useMenuDragger (): DragType {
  // 开始拖拽
  const dragstart = (e: DragEvent, component: CreateComponentType): void => {
    // 将配置项绑定到拖拽属性上
    e.dataTransfer?.setData('dragKey', JSON.stringify(component))
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_CREATE, true)
  }
  const dragend = (): void => {
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_CREATE, false)
  }
  // 开始拖拽模型
  const dragStartModel = (e: DragEvent, item: UeModel): void => {
    // 将配置项绑定到拖拽属性上
    if (item.modelType === 'unreal-engine-five')e.dataTransfer?.setData('ueModel', JSON.stringify(item))
    if (item.modelType === 'two-dimensional-config')e.dataTransfer?.setData('tdConfig', JSON.stringify(item))
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_CREATE, true)
  }
  return {
    dragstart,
    dragend,
    dragStartModel
  }
}
