export const globalData={
	regionList:[]
} 
export const findParentsById = (tree, targetId)=>{
      // 递归函数，用于查找父级节点
      function traverse(node, targetId, path = []) {
        if (node.id === targetId) {
          return path;
        }
        if (node.children) {
          for (let child of node.children) {
            const result = traverse(child, targetId, path.concat(node));
            if (result) {
              return result;
            }
          }
        }
        return null;
      }

      // 从根节点开始遍历
      for (let root of tree) {
        const parents = traverse(root, targetId);
        if (parents) {
          return parents;
        }
      }
      return null; // 如果没有找到目标节点，返回null
    }