import type { AreaListVO } from '@ghcloud/cube-mdata-service/src/type'
import Sortable from 'sortablejs'

let sortableInstance: Sortable | null = null 

export const sortDragTable = (getList: Function) => {
  const tbody = document.querySelector('.areaTable tbody') as any
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  sortableInstance = new Sortable(tbody, {
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
// 获取当前项的深度
export const getDepth = (data, id, currentDepth = 0) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      return currentDepth;
    }
    if (data[i].children && data[i].children.length > 0) {
      const depth = getDepth(data[i].children, id, currentDepth + 1);
      if (depth !== -1) {
        return depth;
      }
    }
  }
  return -1;
}
// 获取当前项的下标
/**
 * 在树形数组中查找指定 ID 的节点，并返回其在数组中的下标
 * @param {Array} data - 树形数组
 * @param {any} targetId - 目标节点的 ID
 * @param {number} [startIndex=0] - 当前层级的起始下标
 * @returns {number} - 目标节点的下标，未找到返回 -1
 */
export const findNodeIndexById = (data, targetId, startIndex = 0) => {
  let index = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === targetId) {
      return startIndex + i;
    }
    if (data[i].children && data[i].children.length > 0) {
      index = findNodeIndexById(data[i].children, targetId, startIndex + i * data[i].children.length);
      if (index !== -1) {
        return index;
      }
    }
  }
  return index;
}


export const moveItemInArray = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex === toIndex) return array;

  const newArray = [...array]; // 避免修改原数组
  const [movedItem] = newArray.splice(fromIndex, 1); // 删除原位置的元素
  newArray.splice(toIndex, 0, movedItem); // 插入到新位置

  return newArray;
};
export const moveNodeInTree = (
  tree: AreaListVO[],
  startKey: number,
  endKey: number
): AreaListVO[] => {
  // 查找并移动节点
  const findAndMove = (nodes: AreaListVO[]): { moved: boolean; newNodes: AreaListVO[]; } => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.id === startKey) {
        for (let j = 0; j < nodes.length; j++) {
          if (nodes[j].id === endKey) {
            // 找到 start 和 end，执行移动
            const newNodes = moveItemInArray([...nodes], i, j);
            return { moved: true, newNodes };
          }
        }
      }

      if (node.children && node.children.length > 0) {
        const result = findAndMove(node.children);
        if (result.moved) {
          const newChildren = result.newNodes;
          const newNodes = [...nodes];
          newNodes[i] = { ...node, children: newChildren };
          return { moved: true, newNodes };
        }
      }
    }
    return { moved: false, newNodes: nodes };
  };

  const result = findAndMove(tree);
  return result.newNodes;
};