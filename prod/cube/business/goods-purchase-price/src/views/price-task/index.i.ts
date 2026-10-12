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
  taskValidity?: string;
  categoryIds?: string[] | number[] | null ;
  userList?: UserState[] | null;
  userIds?: string[] | number[] | null;
  publish?: RateState;
  userNames?: string;
  categoryNames?: string;
  categoryList?: CategoryState[] | null | undefined;

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
  { label: '执行中', value: 'EXEC', color: 'warning' },
  { label: '待接收', value: 'WAIT', color: 'processing' },
  { label: '已结束', value: 'OVER', color: 'success' },
]
