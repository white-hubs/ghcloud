// 获取节点配置
export function getNode(obj: any, nodeId: string | null): any {
  if (obj.id === nodeId) return obj

  let findNode = null

  if (typeof obj.branchs !== 'undefined' && obj.branchs.length > 0) {
    let branchsRes = null
    for (let index = 0; index < obj.branchs.length; index++) {
      branchsRes = getNode(obj.branchs[index], nodeId)
      if (branchsRes != null) {
        break
      }
    }
    findNode = branchsRes
  }

  if ((findNode == null) && typeof obj.children !== 'undefined') {
    findNode = getNode(obj.children, nodeId)
  }

  return findNode
}