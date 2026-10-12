export const UserSignStatus = new Map([
  ['SIGNED', '已签'],
  ['UNSIGNED', '未签'],
  ['LATE', '迟到']
])
export const CultivateTaskStatus = new Map([
  ['WAIT_PUBLISH', '待培训'],
  ['PUBLISHED', '待培训'],
  ['REVOKED', '已结束'],
  ['TRAINING', '进行中'],
  ['OVER', '已结束'],
])
export const CultivateTaskColor = new Map([
  ['WAIT_PUBLISH', '#f7a7aa'],
  ['PUBLISHED', '#07c160'],
  ['REVOKED', '#919595'],
  ['TRAINING', '#e86f31'],
  ['OVER', '#919595'],
])
export const CultivateMode = new Map([
  ['OFFLINE', '线下培训'],
  ['ONLINE', '线上培训'],
])
export interface TrainType {
  id: string;
  name: string;
  themeName: string;
  cultivateTarget: string;
  cultivateMode: string;
  cultivateModeName: string;
  userSignStatus: string;
  speaker: string;
  chargePersonName: string;
  cultivateEndTime: string;
  cultivateAddress: string;
  cultivateContent: string;
  cultivateUserNumber: string;
  cultivateTaskStatus: string;
  sourceCode: string;
  cultivateStartTime: string;
  cultivateTargetName: string;
  chargeUserName: string;
  belated?: boolean;
  cultivateUsers?: CultivateUsersType[] ;
  cultivateCoursewares?: CultivateCourseWaresType[];
  examTaskVO?: ExamType;

}
export interface CultivateUsersType {
  userId: string;
  userName: string;
  userPhone: string;
  userDepartmentName: string;
  userDepartmentId: string;
  userPostName: string;
  merchantName: string;
  userSignStatus: string;
  userSignTime: string;
  belated: string;
  remark: string;
}
export interface CultivateCourseWaresType {
  id: string;
  fileName: string;
  fileSize: string;
  duration?: number;
  files: FileState[];
}

export interface ExamType {
  id: string;
  fileName: string;
  fileSize: string;
  duration?: number;
  files: FileState[];
}
export interface FileState {
  businessKey?: string | null;
  id: string | null;
  name?: null | string;
  path?: null | string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}
