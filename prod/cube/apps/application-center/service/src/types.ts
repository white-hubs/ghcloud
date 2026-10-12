/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface FileVO {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  createTime: string; 
  refCount: number;
  type: string;
  businessKey: string | null;
}

export interface TerminalEntity {
  id: string;
  name: string;
  code: string;
  remark: string;
  enabled: boolean;
}

export interface ApplicationEntity {
  id: string;
  code: string;
  name: string;
  icon: string;
  alias: string;
  enabled: boolean;
  publicAccess: boolean;
  applicationGroupId: string;
  applicationGroupName: string;
  createTime: number;
  updateTime: number;
  version: string;
  viewCount: number;
  fileVO?: FileVO;
  dependAppList: {
    id: string;
    name: string;
    version: string;
  }[];
  terminalList: {
    id: string;
    name: string;
    code: string;
  }[];
  remark: string;
  description: string;
  applicationExtendInfo: {
    description: string;
    featureDesc: string;
    helpInfo: string;
    purchaseInfo: string;
    title: string;
    keywords: string;
    appDesc: string;
  }
}

export interface ApplicationTypeEntity {
  id: string;
  name: string;
}

export interface ApplicationIterationEntity {
  id: string;
  applicationId: string;
  applicationName: string;
  version: string;
  lastVersion: string;
  updateTime: string;
  content: IterationEntity[];
}

export interface IterationEntity {
  iterationId: string;
  category: string;
  content: string;
}

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