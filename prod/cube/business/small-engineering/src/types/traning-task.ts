import type { OSSFile } from '@ghcloud/generic-component'

export enum TraningTaskStatus {
  /** 待发布 */
  WAIT_PUBLISH = 'WAIT_PUBLISH',
  /** 待培训 */
  PUBLISHED = 'PUBLISHED',
  /** 已撤销 */
  REVOKED = 'REVOKED',
  /** 培训中 */
  TRAINING = 'TRAINING',
  /** 已结束 */
  OVER = 'OVER'
}

export const TraningStatusOptions = [
  { label: '已发布', value: TraningTaskStatus.PUBLISHED },
  { label: '待发布', value: TraningTaskStatus.WAIT_PUBLISH },
  { label: '进行中', value: TraningTaskStatus.TRAINING },
  { label: '已完成', value: TraningTaskStatus.OVER }
]

export enum TraningType {
  /** 员工 */
  STAFF = 'STAFF',
  /** 商户 */
  MERCHANT = 'MERCHANT',
}

export const TraningTypeOptions = [
  { label: '员工培训', value: TraningType.STAFF },
  { label: '商户培训', value: TraningType.MERCHANT },
]

export enum TraningMode {
  /** 线上 */
  ONLINE = 'ONLINE',
  /** 线下 */
  OFFLINE = 'OFFLINE',
}

export const TraningModeOptions = [
  { label: '线上培训', value: TraningMode.ONLINE },
  { label: '线下培训', value: TraningMode.OFFLINE },
]

export interface InsertTraningTask {
  /**
   * 负责人
   */
  chargeUserId: string;
  chargeUserName?: string;
  /**
   * 培训地点
   */
  cultivateAddress: string;
  /**
   * 培训内容
   */
  cultivateContent: string;
  /**
   * 培训课件IDS
   */
  cultivateCoursewares: CultivateCourseware[];
  /**
   * 结束时间
   */
  cultivateEndTime: string;
  /**
   * 培训模式，线上（ONLINE）线下（OFFLINE）
   */
  cultivateMode: TraningMode | undefined;
  /**
   * 开始时间
   */
  cultivateStartTime: string;
  /**
   * 培训对象，员工（STAFF）商户（MERCHANT）
   */
  cultivateTarget: TraningType;
  /**
   * 培训任务状态
   */
  cultivateTaskStatus?: string;
  /**
   * 培训人数
   */
  cultivateUserNumber: number | undefined;
  /**
   * 培训人员IDS
   */
  cultivateUsers: CultivateUser[];
  /**
   * 关联考试ID
   */
  examTaskId: string | undefined;
  examTaskName?: string;

  /**
   * 培训名称
   */
  name: string;
  /**
   * 主讲人
   */
  speaker: string;
  /**
   * 主题ID
   */
  themeId: string | undefined;
}

export interface CultivateCourseware {
  fileIds: string;
  fileName: string;
  fileSize: string;
  files?: OSSFile[];
}

export interface CultivateUser {
  /**
   * 商户名称（非商户可以不填）
   */
  merchantName?: string;
  /**
   * 部门ID
   */
  userDepartmentId: string;
  /**
   * 部门名称
   */
  userDepartmentName: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 用户名称
   */
  userName: string;
  /**
   * 用户电话
   */
  userPhone: string;
  /**
   * 职位ID
   */
  userPostId: string;
  /**
   * 职位名称
   */
  userPostName: string;
}
