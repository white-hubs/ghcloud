import type { Graph } from '@antv/x6'

/**
 * 编辑器配置选项
 */
export interface EditorOptions {
  /**
   * 画布容器
   */
  container?: HTMLElement | string
  
  /**
   * 画布宽度
   */
  width?: number
  
  /**
   * 画布高度
   */
  height?: number
  
  /**
   * 是否显示网格
   */
  grid?: boolean | Graph.GridManager.Options
  
  /**
   * 是否启用拖动画布
   */
  panning?: boolean | Graph.PanningManager.Options
  
  /**
   * 是否启用鼠标滚轮缩放
   */
  mousewheel?: boolean | Graph.MouseWheelOptions
  
  /**
   * 是否启用对齐线
   */
  snapline?: boolean | Graph.Options['snapline']
  
  /**
   * 是否启用框选
   */
  selecting?: boolean | Graph.SelectionManager.Options
  
  /**
   * 是否启用撤销重做
   */
  history?: boolean
  
  /**
   * 是否启用滚动画布（无限画布）
   */
  scroller?: boolean | {
    enabled?: boolean
    pannable?: boolean
    [key: string]: any
  }
  
  /**
   * 是否启用小地图（缩略图）
   */
  minimap?: boolean | {
    enabled?: boolean
    container?: HTMLElement
    width?: number
    height?: number
    [key: string]: any
  }

  /**
   * 是否只读模式（业务可用于关闭删除等编辑能力）
   */
  readonly?: boolean
  
  /**
   * 其他 X6 Graph 选项
   */
  [key: string]: any
}

/**
 * 编辑器实例接口
 */
export interface EditorInstance {
  graph: Graph | null
  getGraph: () => Graph | null
  destroy: () => void
  toJSON: () => any
  fromJSON: (data: any) => void
  [key: string]: any
}
