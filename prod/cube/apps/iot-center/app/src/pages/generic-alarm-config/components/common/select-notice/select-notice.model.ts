export type SelectEnum = 'DEPARTMENT' | 'ROLE' | 'USER' | null
export interface TargetModifyParams {
  messageTargetNotify: SelectEnum;
  id: string;
  targetConfig: {
    id?: string;
    userId?: string;
    roleId?: string;
    roleName?: string;
    departmentId?: string;
    userName?: string;
    departmentName?: string;
  }[];
}

export interface NoticeType {
  dutyUser: boolean;
  targetModifyParams: TargetModifyParams[];
  channelTypes: string[];
}
