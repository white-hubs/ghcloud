export enum DynamicTableProcessType {
  // 新增流程状态时，需要 businessType
  ADD = 'ADD',
  // 处理中流程状态时，需要 processId
  HANDLING = 'HANDLING'
}

export interface DynamicTableRoute {
  query: {
    processType?: DynamicTableProcessType;
    businessType?: string;
    processId?: string;
    notOperates?: string;
  };
}