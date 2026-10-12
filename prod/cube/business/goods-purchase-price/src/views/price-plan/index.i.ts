export interface TypeState {
  typeCode: string;
  typeName: string;
  expand: string;
  picture: string | string[];
  icon?: string | string[];
  id?: string | number;
}

export interface InsertState {
  name?: string;
  urgency?: string;
  planDesc?: string;
  startTime?: string;
  endTime?: string;
  publishType?: string;
  publishPeriod?: string;
  publishTime?: string;
  enabled?: boolean;
  enable?: boolean;
  remark?: string;
  categoryIds?: string[] | number[] | null ;
  categoryList?: CategoryState[] | null | undefined;
  userList?: UserState[] | null | undefined;
  userIds?: string[] | number[] | null;
  publish?: RateState;
  userNames?: string;
  categoryNames?: string;
  taskValidity?: string;

}

export interface CategoryState {
  label: string;
  id?: string | number;
  name?: string;
  value: string;
}
export interface UserState {
  id: string;
  name: string;
  gender: string;
}
export interface RateState {
  publishType: string;
  publishPeriod: string;
  publishTime: string;
}
export interface RecordState {
  name: string;
  createUserName: string;
  publishTypeName: string;
  publishPeriod: string;
  publishTime: string;
  createTime: string | number;
  enable: boolean;
  enabled: boolean;
  id: string;

}
export interface SecretState {
  deviceId: string | number;
  secretKey: string;
}

export const StatusOptions = [
  { label: '执行中', value: 'EXEC', color: 'success' },
  { label: '已结束', value: 'OVER', color: 'error' },
  { label: '已停用', value: 'STOP', color: 'warning' },
  { label: '全部', value: 'ALL', color: 'processing' },
]
