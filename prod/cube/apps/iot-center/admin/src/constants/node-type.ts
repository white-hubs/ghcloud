/**
 * 节点类型枚举
 */
export enum NodeType {
  /** 直连设备 */
  DIRECT_DEVICE = 1,
  /** 网关设备 */
  GATEWAY_DEVICE = 2,
  /** 网关子设备 */
  GATEWAY_SUB_DEVICE = 3,
}

/**
 * 节点类型选项
 */
export const NODE_TYPE_OPTIONS = [
  { label: "直连设备", value: NodeType.DIRECT_DEVICE },
  { label: "网关设备", value: NodeType.GATEWAY_DEVICE },
  { label: "网关子设备", value: NodeType.GATEWAY_SUB_DEVICE },
] as const;

/**
 * 节点类型映射表（用于翻译）
 */
export const NODE_TYPE_MAP: Record<number, string> = {
  [NodeType.DIRECT_DEVICE]: "直连设备",
  [NodeType.GATEWAY_DEVICE]: "网关设备",
  [NodeType.GATEWAY_SUB_DEVICE]: "网关子设备",
};

/**
 * 获取节点类型标签（翻译函数）
 * @param nodeType 节点类型值（数字）
 * @returns 节点类型标签，如果未找到则返回原值或 "--"
 */
export const getNodeTypeLabel = (nodeType: number | string | null | undefined): string => {
  if (nodeType === null || nodeType === undefined) {
    return "--";
  }
  const typeValue = typeof nodeType === "string" ? Number.parseInt(nodeType, 10) : nodeType;
  if (Number.isNaN(typeValue)) {
    return String(nodeType);
  }
  return NODE_TYPE_MAP[typeValue] ?? String(nodeType);
};
