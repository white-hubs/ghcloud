import { EditCanvasTypeEnum, type ComponentStylesState, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import throttle from 'lodash/throttle'
const chartEditStore = useChartEditStore()
interface StyleAttr {
  zIndex?: number;
  left?: string;
  top?: string;
}
interface SizeAttr {
  width: string;
  height: string;
  transition?: string;
  opacity?: number;
  transform?: string;
}
export const getComponentStyle = (attr: ComponentStylesState): StyleAttr => {
  const componentStyle = {
    position: 'absolute',
    left: `${attr.x}px`,
    top: `${attr.y}px`,
    transition: 'all .2s ease',
    opacity: attr.show ? 1 : 0,
    transform: attr.show ? 'scale(1)' : 'scale(0.5)',
  }
  return componentStyle
}
export const getChartStyle = (attr: ComponentStylesState, scale?: number): SizeAttr => {
  return {
    width: `${scale ? scale * attr.width : attr.width}px`,
    height: `${scale ? scale * attr.height : attr.height}px`,
    transition: 'all .2s ease',
    opacity: attr.show ? 1 : 0,
    transform: attr.show ? 'scale(1)' : 'scale(0.5)',
  }
}
export const getSizeStyle = (attr: ComponentStylesState, scale?: number): SizeAttr => {
  return {
    width: `${scale ? scale * attr.width : attr.width}px`,
    height: `${scale ? scale * attr.height : attr.height}px`,
  }
}
// 全局样式
export const getEditCanvasConfigStyle = (canvas: { width: number; height: number; }): {
  position?: string;
  width?: string;
  height?: string;
} => {
  return {
    position: 'relative' as const,
    width: canvas.width ? `${canvas.width || 100}px` : '100%',
    height: canvas.height ? `${canvas.height}px` : '100%',
  }
}
interface PointStyleState {
  left: string;
  top: string;
  cursor: string;
}
// 锚点位置
export const getPointStyle = (
  point: string,
  index: number,
  attr: ComponentStylesState,
  cursorResize: string[]
): PointStyleState => {
  const { width, height } = attr

  const isTop = point.includes('t')
  const isBottom = point.includes('b')
  const isLeft = point.includes('l')
  const isRight = point.includes('r')

  let newLeft = 0
  let newTop = 0

  // 四个角的点
  if (point.length === 2) {
    newLeft = isLeft ? 0 : width
    newTop = isTop ? 0 : height
  } else {
    // 上下两点的点，宽度居中
    if (isTop || isBottom) {
      newLeft = width / 2
      newTop = isTop ? 0 : height
    }

    // 左右两边的点，高度居中
    if (isLeft || isRight) {
      newLeft = isLeft ? 0 : width
      newTop = Math.floor(height / 2)
    }
  }

  const style = {
    left: `${newLeft}px`,
    top: `${newTop}px`,
    cursor: cursorResize[index] + '-resize'
  }

  return style
}
// * 移动锚点
export const mousePointHandle = (e: MouseEvent, point: string, component: CreateComponentType): void => {
  e.stopPropagation()
  e.preventDefault()
  // 设置拖拽状态
  chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_DRAG, true)
  const scale = chartEditStore.getEditCanvas.scale
  const itemAttrX = component.styles?.x ?? 0
  const itemAttrY = component.styles?.y ?? 0
  const itemAttrW = component.styles?.width
  const itemAttrH = component.styles?.height

  // 记录点击初始位置
  const startX = e.screenX
  const startY = e.screenY

  // 记录初始位置

  const mousemove = throttle((moveEvent: MouseEvent) => {
    const currX = Math.round((moveEvent.screenX - startX) / scale)
    const currY = Math.round((moveEvent.screenY - startY) / scale)

    const isTop = point.includes('t')
    const isBottom = point.includes('b')
    const isLeft = point.includes('l')
    const isRight = point.includes('r')

    const newHeight = itemAttrH ? itemAttrH + (isTop ? -currY : isBottom ? currY : 0) : 0
    const newWidth = itemAttrW ? itemAttrW + (isLeft ? -currX : isRight ? currX : 0) : 0
    if (component.styles) {
      component.styles.height = newHeight > 0 ? newHeight : 0
      component.styles.width = newWidth > 0 ? newWidth : 0
      component.styles.x = itemAttrX + (isLeft ? currX : 0)
      component.styles.y = itemAttrY + (isTop ? currY : 0)
    }
    chartEditStore.updateBlockSize(component)
  }, 50)

  const mouseup = (): void => {
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_DRAG, false)
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }

  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}
// 将16进制颜色转为rgba
export const hex2Rgba = (hex: string, opacity: number) => {
  if (!hex) hex = '#2989FF'
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  )
}
