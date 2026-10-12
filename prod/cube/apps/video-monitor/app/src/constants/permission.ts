/**
 * 权限管理相关常量
 */

// 默认分页配置
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10
} as const

// 防抖延迟时间（毫秒）
export const DEBOUNCE_DELAY = 100

// 搜索防抖延迟时间（毫秒）
export const SEARCH_DEBOUNCE_DELAY = 300

// 范围类型标签映射
export const SCOPE_TYPE_LABEL_MAP: Record<'area' | 'group' | 'device', string> = {
  area: '区域',
  group: '分组',
  device: '设备'
} as const

// 范围类型颜色映射
export const SCOPE_TYPE_COLOR_MAP: Record<'area' | 'group' | 'device', string> = {
  area: 'default',
  group: 'blue',
  device: 'green'
} as const

// 权限归属类型标签映射
export const OWNERSHIP_TYPE_LABEL_MAP: Record<'department' | 'role' | 'user', string> = {
  department: '部门',
  role: '角色',
  user: '人员'
} as const

// 权限归属类型颜色映射
export const OWNERSHIP_TYPE_COLOR_MAP: Record<'department' | 'role' | 'user', string> = {
  department: 'blue',
  role: 'orange',
  user: 'green'
} as const

// 最大列表加载数量
export const MAX_LIST_SIZE = 1000

