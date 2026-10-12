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
  userList?: UserState[] | null;
  userIds?: string[] | number[] | null;
  publish?: RateState;
  userNames?: string;
  categoryNames?: string;

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
  minPrice: string | number;
  midPrice: string | number;
  maxPrice: string | number;
  enable: boolean;
  enabled: boolean;
  id: string;
  isEdit: boolean;

}
export interface SecretState {
  deviceId: string | number;
  secretKey: string;
}

export const StatusOptions = [
  { label: '待完成', value: '0', color: 'processing' },
  { label: '已完成', value: '1', color: 'success' },
  { label: '全部', value: 'ALL', color: 'processing' },
]
