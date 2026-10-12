import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { EditCanvasTypeEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { throttle } from 'lodash'

const chartEditStore = useChartEditStore()
// * 不拦截默认行为点击
export const mousedownHandleUnStop = (): void => {
  // chartEditStore.setTargetComp(undefined)
}
// 鼠标按下
export const handleMouseDown = (e: MouseEvent): void => {
  const target = e.target
  if (target instanceof Element) {
    if (target.getAttribute('id')) {
      // 取消选中
      chartEditStore.active.targetId = []
    }
  }
  rightDown(e)
  mousedownBoxSelect(e)
}
const rightDown = (e: MouseEvent): void => {
  // 阻止右键的默认行为
  if (e.button === 2) {
    document.getElementById('go-chart-edit-content')?.addEventListener('contextmenu', function (e: MouseEvent) {
      e.preventDefault()
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_RIGHT_CLICK, true)
    })
    return
  }
  // 关闭右键
  if (e.button === 0) {
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_RIGHT_CLICK, false)
  }
}
// * 框选
const mousedownBoxSelect = (e: MouseEvent): void => {
  if (!window.$KeyboardActive?.ctrl) return
  mousedownHandleUnStop()
  // 记录点击初始位置
  const startScreenX = e.screenX
  const startScreenY = e.screenY
  const startOffsetX = e.offsetX
  const startOffsetY = e.offsetY
  chartEditStore.setMousePosition(undefined, undefined, startOffsetX, startOffsetY)
  // 如果在进行拖拽,不进行框选
  if (chartEditStore.isDrag) return
  // 记录缩放
  const scale = chartEditStore.getEditCanvas.scale
  // 移动框选
  const mousemove = throttle((moveEvent: MouseEvent) => {
    // 取消当前选中
    chartEditStore.setTargetComp()
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_SELECT, true)
    // 这里先把相对值算好，不然组件无法获取 startScreenX 和 startScreenY 的值
    const currX = startOffsetX + moveEvent.screenX - startScreenX
    const currY = startOffsetY + moveEvent.screenY - startScreenY
    chartEditStore.setMousePosition(currX, currY)
    // 计算框选的左上角和右下角
    const selectAttr = {
      // 左上角
      x1: 0,
      y1: 0,
      // 右下角
      x2: 0,
      y2: 0
    }
    if (currX > startOffsetX && currY > startOffsetY) {
      // 右下方向
      selectAttr.x1 = startOffsetX
      selectAttr.y1 = startOffsetY
      selectAttr.x2 = Math.round(startOffsetX + (moveEvent.screenX - startScreenX) / scale)
      selectAttr.y2 = Math.round(startOffsetY + (moveEvent.screenY - startScreenY) / scale)
    } else if (currX > startOffsetX && currY < startOffsetY) {
      // 右上方向
      selectAttr.x1 = startOffsetX
      selectAttr.y1 = Math.round(startOffsetY - (startScreenY - moveEvent.screenY) / scale)
      selectAttr.x2 = Math.round(startOffsetX + (moveEvent.screenX - startScreenX) / scale)
      selectAttr.y2 = startOffsetY
    } else if (currX < startOffsetX && currY > startOffsetY) {
      selectAttr.x1 = Math.round(startOffsetX - (startScreenX - moveEvent.screenX) / scale)
      selectAttr.y1 = startOffsetY
      selectAttr.x2 = startOffsetX
      selectAttr.y2 = Math.round(startOffsetY + (moveEvent.screenY - startScreenY) / scale)
      // 左下方向
    } else {
      // 左上方向
      selectAttr.x1 = Math.round(startOffsetX - (startScreenX - moveEvent.screenX) / scale)
      selectAttr.y1 = Math.round(startOffsetY - (startScreenY - moveEvent.screenY) / scale)
      selectAttr.x2 = startOffsetX
      selectAttr.y2 = startOffsetY
    }
    // 遍历组件
    chartEditStore.getCurrentPageComponents.forEach(item => {
      // 处理左上角
      // let isSelect = false
      const { x, y, width, height } = item.styles
      const targetAttr = {
        // 左上角
        x1: x,
        y1: y,
        // 右下角
        x2: (x ?? 0) + width,
        y2: (y ?? 0) + height
      }

      // 全包含则选中
      if (targetAttr.x1 && targetAttr.y1 &&
        targetAttr.x1 - selectAttr.x1 >= 0 &&
        targetAttr.y1 - selectAttr.y1 >= 0 &&
        targetAttr.x2 - selectAttr.x2 <= 0 &&
        targetAttr.y2 - selectAttr.y2 <= 0
      ) {
        // isSelect = true
        chartEditStore.setTargetComp(item.id, true)
        // chartEditStore.setTargetComp(item.id)
      }
    })
  }, 30)

  // 鼠标抬起
  const mouseup = (): void => {
    // 鼠标抬起时，结束mousemove的节流函数，避免选框不消失问题
    mousemove.cancel()
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_SELECT, false)
    chartEditStore.setMousePosition(0, 0, 0, 0)
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}
// * 进入事件
// export const mouseenterHandle = (e: MouseEvent, item: CreateComponentType | CreateComponentType[]): void => {
//   e.preventDefault()
//   e.stopPropagation()
//   if (!chartEditStore.getEditCanvas.isSelect) {
//     // chartEditStore.setTargetHoverChart(item.id)
//   }
// }
