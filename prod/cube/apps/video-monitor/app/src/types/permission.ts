/**
 * 权限管理相关类型定义
 */

// 权限归属项
export interface OwnershipItem {
  type: 'department' | 'role' | 'user';
  name: string;
}

// 监控范围项
export interface ScopeItem {
  type: 'area' | 'group' | 'device';
  name: string;
}

// 权限记录
export interface PermissionRecord {
  id: string;
  monitorScope: ScopeItem[];
  devicesCount: number;
  ownership: OwnershipItem[];
}

// 设备信息
export interface DeviceInfo {
  id: string;
  code: string;
  name: string;
  region: string;
}

// 范围树节点
export interface ScopeTreeNode {
  key: string;
  title: string;
  deviceIds?: string[];
  children?: ScopeTreeNode[];
}

// 设备显示信息（包含来源）
export interface DeviceDisplay extends DeviceInfo {
  fromScope: string;
}

// 选择器选项
export interface SelectOption {
  label: string;
  value: string;
}

// 范围摘要
export interface ScopeSummary {
  areaCount: number;
  groupCount: number;
  deviceCount: number;
}

