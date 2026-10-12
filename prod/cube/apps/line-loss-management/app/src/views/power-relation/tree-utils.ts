
export const moveItemInArray = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex === toIndex) {
    return array;
  }

  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);

  return newArray;
};

interface TreeNode {
  key: string;
  children?: TreeNode[];
  [key: string]: any;
}

export const moveNodeInTree = <T extends TreeNode>(tree: T[], startKey: string, endKey: string): T[] => {
  const findAndMove = (nodes: T[]): { moved: boolean; newNodes: T[] } => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.key === startKey) {
        for (let j = 0; j < nodes.length; j++) {
          if (nodes[j].key === endKey) {
             const newNodes = moveItemInArray([...nodes], i, j);
             return { moved: true, newNodes };
          }
        }
      }
      if (node.children && node.children.length > 0) {
        const result = findAndMove(node.children as T[]);
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
