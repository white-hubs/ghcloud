// 获取经纬度信息
export const getLatLong = (coordinate) => {
  // 使用正则表达式去除空白字符，并将字符串分割为数组
  const parts = coordinate.replace(/[\t\r\f\n\s]*/g, '').split(',');
  return {
      latitude: parts[0], // 纬度
      longitude: parts[1] // 经度
  };
};

// 通过 ID 查找项目
export const findItemById = (data, id) => {
  for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.id === id) {
          return item; // 如果找到匹配的 ID，返回该项目
      } else {
          if (item.children && item.children.length > 0) {
              // 如果当前项目有子项目，递归查找
              let result = findItemById(item.children, id);
              if (result) return result; // 如果在子项目中找到，返回结果
          }
      }
  }
  return null; // 如果未找到，返回 null
};

// 通过 ID 查找父级项目
export const findParentsById = (data, id) => {
  function findParentsRecursive(node, targetId, path = []) {
      if (node.id === targetId) {
          return path; // 如果找到匹配的 ID，返回路径
      }
      if (node.children) {
          for (let child of node.children) {
              // 递归查找子项目，并将当前节点添加到路径中
              const result = findParentsRecursive(child, targetId, path.concat(node));
              if (result) return result; // 如果在子项目中找到，返回路径
          }
      }
      return null; // 如果未找到，返回 null
  }
  for (let item of data) {
      const result = findParentsRecursive(item, id);
      if (result) return result; // 如果找到路径，返回结果
  }
  return null; // 如果未找到，返回 null
};