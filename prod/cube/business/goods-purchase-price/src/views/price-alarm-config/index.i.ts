export interface TypeState {
  typeCode: string;
  typeName: string;
  expand: string;
  picture: string | string[];
  icon?: string | string[];
  id?: string | number;
}

export interface InsertState {
  enabled?: boolean | undefined;
  enable?: boolean | undefined;
  remark?: string | null | undefined;
  categoryIds?: string[] | number[] | null | undefined ;
  userList?: UserState[] | null | undefined;
  users?: UserState[] | null | undefined;
  userIds?: string[] | number[] | string | null | undefined;
  userNames?: string | undefined;
  categoryNames?: string | undefined;
  groupName?: string | undefined;
  goodsCategoryIds?: string[] | number[] | undefined;
  priceType?: string | undefined;
  compareCondition?: string | undefined;
  compareValue?: number | null | undefined;
  priceRule?: RuleState | RuleState[] | null | undefined;
  rules?: RuleState[];
}
export interface RuleState {
  goodsCategoryIds?: string[] | number[] | undefined;
  priceType?: string | undefined;
  compareCondition?: string | undefined;
  compareValue?: number | undefined;
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
  remark: boolean;
  status: boolean;
  id: string;
  groupName: string;
  categories: string;

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
