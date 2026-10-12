import Sortable from 'sortablejs'

let sortableInstance: Sortable | null = null 

export const sortDragTable = (getList: Function, isSort: boolean = true) => {
  const tbody = document.querySelector('.lineTable tbody') as any

  if (sortableInstance) {
    sortableInstance.destroy()
  }

  sortableInstance = new Sortable(tbody, {
    // 是否禁用拖拽排序
    disabled: !isSort,
    // ms, number 单位：ms，定义排序动画的时间
    animation: 150,
    // 设置拖拽样式类名
    dragClass: 'drop-dragClass',
    // 设置拖拽停靠样式类名
    ghostClass: 'drop-ghostClass',
    // 设置选中样式类名
    chosenClass: 'drop-chosenClass',
    // 关键代码
    onEnd(evt: any) {
      // 结束拖拽
      getList(evt)
    }
  })
}

// 交换数组两个项位置
export const changeArrayIndex = (arr: unknown[], oldIndex:  number, newIndex:  number): unknown[] => {
  var item = arr.splice(oldIndex, 1)[0];
  arr.splice(newIndex, 0, item);
  return arr
}