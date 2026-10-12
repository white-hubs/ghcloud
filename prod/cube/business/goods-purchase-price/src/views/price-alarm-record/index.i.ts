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
  goodsCategoryName?: string;
  maxPriceAvg?: string;
  midPriceAvg?: string;
  minPriceAvg?: string;
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
  enable: boolean;
  enabled: boolean;
  id: string;

}
export interface SecretState {
  deviceId: string | number;
  secretKey: string;
}
