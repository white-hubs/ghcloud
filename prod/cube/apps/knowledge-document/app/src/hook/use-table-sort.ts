import type { KnowledgeDocumentTypeModel } from "@ghcloud/cube-knowledge-document-service";
export const changeData = (
  list: KnowledgeDocumentTypeModel[],
  key: string | undefined,
  item: Partial<KnowledgeDocumentTypeModel>,
): KnowledgeDocumentTypeModel[] => {
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (element.id === key) {
      list[i] = { ...element, ...item };
      return list;
    }
    if (element.children && element.children.length > 0) {
      element.children = changeData(element.children, key, item);
    }
  }
  return list;
};
export const findNodeIndexById = (data: KnowledgeDocumentTypeModel[], targetId: string | undefined, startIndex = 0): number => {
  let index = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === targetId) {
      return startIndex + i;
    }
    if (Array.isArray(data[i].children) && data[i].children!.length > 0) {
      index = findNodeIndexById(data[i].children!, targetId, startIndex + i * data[i].children!.length);
      if (index !== -1) {
        return index;
      }
    }
  }
  return index;
};
export const filterEmptyChildren = (nodes: KnowledgeDocumentTypeModel[]): KnowledgeDocumentTypeModel[] =>
  nodes
    .map((node) => {
      // 浅拷贝节点，避免修改原始数据
      const newNode = { ...node };

      // 递归处理子节点
      if (newNode.children) {
        const filteredChildren = filterEmptyChildren(newNode.children);
        if (filteredChildren.length > 0) {
          newNode.children = filteredChildren;
        } else {
          delete newNode.children; // 删除空数组
        }
      }

      return newNode;
    })
    .filter((node) => hasMeaningfulData(node));

/**
 * 判断节点是否有保留价值（根据业务扩展）
 */
const hasMeaningfulData = (node: KnowledgeDocumentTypeModel): boolean => !!node.typeName || !!node.typeName || node.id !== undefined;
export const moveItemInArray = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex === toIndex) {
    return array;
  }

  const newArray = [...array]; // 避免修改原数组
  const [movedItem] = newArray.splice(fromIndex, 1); // 删除原位置的元素
  newArray.splice(toIndex, 0, movedItem); // 插入到新位置

  return newArray;
};
export const moveNodeInTree = (tree: KnowledgeDocumentTypeModel[], startKey: string, endKey: string): KnowledgeDocumentTypeModel[] => {
  // 查找并移动节点
  const findAndMove = (nodes: KnowledgeDocumentTypeModel[]): { moved: boolean; newNodes: KnowledgeDocumentTypeModel[] } => {
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
