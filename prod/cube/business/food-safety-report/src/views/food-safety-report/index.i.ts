export const StatusOptions = [
  { label: '阳性', value: 'POS', color: 'red' },
  { label: '阴性', value: 'NEG', color: 'green' },
]

export interface InsertState {
  checkerName?: string;
  checkItem?: string;
  checkResult?: string | null;
  goodsCategoryName?: string;
  goodsFrom?: string;
  stallCode?: string;
  checkDate?: string;
  sampleCode?: string;

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
  checkDate: number;
  checkerName: string;
  checkItem: string;
  checkResult: string | null;
  goodsCategoryName: string;
  goodsFrom: string;
  id: string;
  stallCode: string;

}
export interface SecretState {
  deviceId: string | number;
  secretKey: string;
}
