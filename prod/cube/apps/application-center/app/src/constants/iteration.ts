/**
 * 迭代类型选项常量
 */
export interface IterationTypeOption {
  label: string;
  value: string;
}

export const IterationTypeOptions: IterationTypeOption[] = [
  { label: '新增', value: 'ADD' },
  { label: '修复', value: 'FIX' },
  { label: '优化', value: 'OPTIMIZE' },
  { label: '删除', value: 'REMOVE' }
]

/**
 * 根据值获取标签
 * @param value 迭代类型值
 * @returns 对应的标签，如果未找到返回 '--'
 */
export const getIterationTypeLabel = (value: string): string => {
  return IterationTypeOptions.find(option => option.value === value)?.label || '--'
}