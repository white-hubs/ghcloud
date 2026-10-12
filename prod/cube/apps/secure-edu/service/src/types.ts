import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'

interface OSSFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}

/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export interface RuleNormParam {
  /**
   * 字典编码
   */
  normCode?: string;
  /**
   * 是否展示
   */
  display?: number;
  /**
   * 下限
   */
  lowerLimit?: number | null;
  /**
   * 指标名称
   */
  normName?: string;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 上限
   */
  upperLimit?: number | null;
}

/**
* RealTimeMonitorVO
*/
export interface RealTimeMonitorVO {
  areaId: string;
  details: NormDataVO[];
  id: string;
  /**
   * 手术室名称
   */
  operatingRoomName: string;
  /**
   * 手术室状态
   */
  status: string;
  deviceInfo: SecurityDeviceRecord;
}

export enum DevicePropStatus {
  NORMAL = 'NORMAL', // 正常
  LOWER_LIMIT = 'LOWER_LIMIT', // 低于下限
  UPPER_LIMIT = 'UPPER_LIMIT', // 超过上限
}
/**
* 指标详情
*
* NormDataVO
*/
export interface NormDataVO {
  /**
   * 指标编码
   */
  normCode: string;
  /**
   * 指标名称
   */
  normName: string;
  /**
   * 指标状态:NORMAL("正常"),LOWER_LIMIT("下限"),UPPER_LIMIT("上限")
   */
  status?: DevicePropStatus;
  /**
   * 指标单位
   */
  unit?: string;
  /**
   * 指标数值
   */
  value: number | undefined;

  display: number | null;
}
// 考试用户
export interface ExamUser {
  id: string;
  examTaskId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userDepartmentId: string;
  userDepartmentName: string;
  userPostId: string;
  userPostName: string;
  userExamTaskRecordId: unknown;
  examStatus: string;
  examNumber: number;
  passed: null | boolean;
  score: number | null;
}
// 考试问题类型枚举
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  JUDGE = 'JUDGE',
}
// 考试详情类型
export interface ExamDetailState {
  id: string;
  name: string;
  themeId: string;
  themeName: string;
  examStartTime: number;
  examEndTime: number;
  examPaperId: string;
  examPaperName: string;
  examPaperContent: string;
  examPaperDetails?: PaperState;
  chargeUserId: string;
  chargeUserName: string;
  timed: boolean;
  examDuration: number;
  examDurationUnit: string;
  retake: boolean;
  retakeNumber: number;
  examTaskType: string;
  examTaskTypeName: string;
  examUserNumber: number;
  examTaskStatus: string;
  examTaskStatusName: string;
  remark: string;
  examUsers: ExamUser[];
  examFrequencyLimit: boolean;
}
// 考试题
export interface ExamQuestion {
  id: string;
  name: string;
  examPaperQuestionCategoryId: string;
  examPaperQuestionCategoryTitle: string;
  themeId: string;
  themeName: string;
  questionType: QuestionType;
  questionTypeName: string;
  questionContent: string;
  score: number;
  answerAnalysis: string;
  sort: number;
  answerState: null | boolean;
  editState: null | boolean;
}
// 问题类别
export interface QuestionCategory {
  id: string;
  title: string;
  sort: number;
  examQuestions: ExamQuestion[];
}
// 试卷详情数据
export interface PaperState {
  id: string;
  name: string;
  score: number;
  passingGradeScore: number;
  remark: string;
  examPaperQuestionNumber: number;
  retake: boolean;
  timed: boolean;
  questionCategories: QuestionCategory[];
  examQuestions: ExamQuestion[];
}

/** 总部培训任务记录 */
export interface HeadQuartersCultivateTaskRecord {
  /**
   * 负责人
   */
  chargePersonName: string;
  /**
   * 培训地点
   */
  cultivateAddress: string;
  /**
   * 培训内容
   */
  cultivateContent: string;
  /**
   * 培训截至时间
   */
  cultivateEndTime: string;
  /**
   * 培训形式
   */
  cultivateMode: CultivateMode | undefined;
  /**
   * 培训对象
   */
  cultivateTarget: string;
  cultivateTaskStatus: string;
  /**
   * 培训人数
   */
  cultivateUserNumber: string;
  name: string;
  /**
   * 主讲人
   */
  speaker: string;
  themeName: string;
}

enum CultivateMode {
  /** 线上 */
  ONLINE = 'ONLINE',
  /** 线下 */
  OFFLINE = 'OFFLINE',
}
export interface CultivateCourseWare {
  fileIds: string;
  fileName: string;
  fileSize: string;
  duration: number;
  files?: OSSFile[];
}
export enum TrainingType {
  /** 员工 */
  STAFF = 'STAFF',
  /** 商户 */
  MERCHANT = 'MERCHANT',
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

/** 总部 培训任务信息 */
export interface HeadQuartersCultivateTaskInfo {
  /**
   * 负责人
   */
  chargeUserId: string;
  /**
   * 负责人名称
   */
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
   * 培训课件集合
   */
  cultivateCoursewares: {
    /**
     * 文件集合，文件IDS;逗号分割
     */
    fileIds: string;
    /**
     * 文件名称
     */
    fileName: string;
    duration: number;
    /**
     * 文件大小
     */
    fileSize: string;
    files?: OSSFile[];
  }[];
  /**
   * 结束时间
   */
  cultivateEndTime: string;
  /**
   * 培训模式，线上（ONLINE）线下（OFFLINE）
   */
  cultivateMode: string;
  /**
   * 开始时间
   */
  cultivateStartTime: string;
  /**
   * 培训对象，员工（STAFF）商户（MERCHANT）
   */
  cultivateTarget: string;
  /**
   * 培训市场集合
   */
  cultivateTaskMarkets: {
    /**
     * 市场编号
     */
    marketCode: string;
    /**
     * 市场名称
     */
    marketName: string;
    /**
     * 市场租户编号
     */
    marketTenantCode: number;
  }[];
  /**
   * 培训任务状态
   */
  cultivateTaskStatus?: string;
  /**
   * 培训人数
   */
  cultivateUserNumber: number | undefined;
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

/** 市场培训任务信息 */
export interface MarketCultivateTaskInfo {
  sourceCode: 'LOCAL_CREATE' | 'HEADQUARTERS';
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
  cultivateCoursewares: CultivateCourseWare[];
  /**
   * 结束时间
   */
  cultivateEndTime: string;
  /**
   * 培训模式，线上（ONLINE）线下（OFFLINE）
   */
  cultivateMode: CultivateMode | undefined;
  /**
   * 开始时间
   */
  cultivateStartTime: string;
  /**
   * 培训对象，员工（STAFF）商户（MERCHANT）
   */
  cultivateTarget: TrainingType | undefined;
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

export enum ExamTaskType {
  MERCHANT_EXAM = 'MERCHANT_EXAM',
  STAFF_EXAM = 'STAFF_EXAM',
}

/** 总部 考试任务信息 */
export interface HeadQuartersExamTaskInfo {
  /**
   * 负责人主键
   */
  chargeUserId: string;
  /**
   * 考试时长
   */
  examDuration?: string;
  /**
   * 考试市场单位
   */
  examDurationUnit?: string;
  /**
   * 考试结束时间
   */
  examEndTime: string;
  /**
   * 试卷主键
   */
  examPaperIds: string[];
  /**
   * 考试开始时间
   */
  examStartTime: string;
  /**
   * 考试市场集合
   */
  examTaskMarkets: {

    /**
   * 市场编码
   */
    marketCode: string;
    /**
   * 市场名称
   */
    marketName: string;
    /**
   * 市场租户编号
   */
    marketTenantCode: number;
  }[];
  /**
   * 考试类型
   */
  examTaskType: ExamTaskType;
  /**
   * 考试人数
   */
  examUserNumber: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 考试说明
   */
  remark?: string;
  /**
   * 是否支持复考
   */
  retake: boolean;
  /**
   * 复考次数
   */
  retakeNumber?: number;
  /**
   * 考试主题主键
   */
  themeId: string;
  /**
   * 是否限时
   */
  timed: boolean;

}

/** 市场 考试任务信息 */
export interface MarketExamTaskInfo {
  sourceCode: string;
  id?: string;
  /**
   * 负责人主键
   */
  chargeUserId: string | undefined;
  /**
   * 考试时长
   */
  examDuration?: string;
  /**
   * 考试市场单位
   */
  examDurationUnit?: string;
  /**
   * 考试结束时间
   */
  examEndTime: string;
  /**
   * 试卷主键
   */
  examPaperId: string | undefined;
  /**
   * 考试开始时间
   */
  examStartTime: string;
  /**
   * 考试类型
   */
  examTaskType: ExamTaskType | undefined;
  /**
   * 考试人数
   */
  examUserNumber: number | undefined;
  examUsers: ExamUser[];
  /**
   * 名称
   */
  name: string;
  /**
   * 考试说明
   */
  remark?: string;
  /**
   * 是否支持复考
   */
  retake: boolean;
  /**
   * 复考次数
   */
  retakeNumber?: number | undefined;
  /**
   * 考试主题主键
   */
  themeId: string | undefined;
  /**
   * 是否限时
   */
  timed: boolean;
}
export interface ExamResultState {
  id: string;
  paperScore: number;
  passed: boolean;
  score: number;
  passingRate: number;
}
// 考试记录字段
export interface ExamRecordState {
  id: string;
  createTime: string;
  passed: boolean;
  score: number;
}

/** 市场PC外链 */
export interface MarketPCUrl {
  /**
     * 启用状态
     */
  enabled: boolean;
  id: string;
  /**
     * 市场配置主键
     */
  marketId: string;
  /**
     * 市场名称
     */
  marketName: string;
  /**
     * 市场编号
     */
  marketTenant: number;
  /** 市场服务地址 */
  url: string;
}
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
  cultivateUsers?: CultivateUsersType[] ;
  cultivateCoursewares?: CultivateCourseWaresType[];
}
export interface CultivateUsersType {
  userId: string;
  userName: string;
  userPhone: string;
  userDepartmentName: string;
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
  files: [
    {
      name: string;
      suffix: string;
      path: string;
      size: string;
    }
  ];
}
export interface QuestionOptionState {
  isCheck: boolean;
  isRight: boolean;
  optionID: string;
  optionTitle: string;
  sort: number;
}

/** 总部 培训记录 */
export interface HeadQuartersCultivateUserRecord {
  /**
   * 培训任务信息
   */
  cultivateTask: {
    /**
     * 负责人名称
     */
    chargeUserName: string;
    /**
     * 培训形式(线上、线下)
     */
    cultivateMode: CultivateMode;
    /**
     * 培训结束时间
     */
    endTime: string;
    /**
     * 任务名称
     */
    name: string;
    /**
     * 培训开始时间
     */
    startTime: string;
    /**
     * 主题名称
     */
    themeName: string;
  };
  /**
   * 部门名称
   */
  departmentName: string;
  id: string;
  /**
   * 市场信息
   */
  market: {
    /**
   * 租户名称
   */
    marketName: string;
    /**
   * 租户编号
   */
    marketTenant: number;
  };
  /**
   * 用户名称
   */
  name: string;
  /**
   * 岗位名称
   */
  postName: string;
  /**
   * 签到信息
   */
  signInfo: {
    /**
     * 是否迟到，true:迟到,false:正常
     */
    belated: boolean;
    /**
     * 签到时间
     */
    signDate: string;
    /**
     * 签到状态
     */
    status: 'SIGNED' | 'UNSIGNED';
  };
}

/** 培训任务统计 */
export interface CultivateTaskStat {
  /**
   * 培训数
   */
  cultivateNum: number;
  /**
   * 关联考试的培训数
   */
  examNum: number;
  /**
   * 针对商户的培训数
   */
  merchantNum: number;
  /**
   * 线下培训数
   */
  offlineNum: number;
  /**
   * 在线培训数
   */
  onlineNum: number;
  /**
   * 培训数环比
   */
  qoq: number;
  /**
   * 针对员工的培训数
   */
  staffNum: number;
  /**
   * 主题数
   */
  themeNum: number;
}

/** 培训人员情况统计 */
export interface CultivateTaskTrainUserStat {
  /**
   * 迟到人数
   */
  belatedNum: number;
  /**
   * 签到人数
   */
  signedNum: number;
  /**
   * 培训人数
   */
  trainNum: number;
  /**
   * 未签人数
   */
  unsignedNum: number;
}

/** 统计接口 - 考试任务统计(数量,环比 不及格,缺考) */
export interface ExamTaskStat {
  /**
   * 环比率
   */
  chainRatio: number;
  /**
   * 缺考人数
   */
  missExamUserNumber: number;
  /**
   * 不及格人数
   */
  noPassedUserNumber: number;
  /**
   * 考试任务数
   */
  totalNum: number;
}
export interface UserInfoState {
  userIdentify: string;
  userName: string;
  userPhone: string;
  userDepartmentName: string;
  userPostName: string;
}
export interface ImportExamQuestionVO {
  /**
   * 错误信息
   */
  errorMsg?: string[] | null;
  /**
   * 失败数
   */
  fail?: number | null;
  /**
   * 错误数据
   */
  importErrorList?: ExamQuestionBankImportVO[] | null;
  /**
   * 成功数
   */
  success?: number | null;
}
export interface ExamQuestionBankImportVO {
  /**
   * 答案解析
   */
  answerAnalysis?: null | string;
  /**
   * 名称
   */
  name?: null | string;
  /**
   * 选项
   */
  optionA?: null | string;
  optionB?: null | string;
  /**
   * 选项
   */
  options?: QuestionOptionVO[] | null;
  /**
   * 题目类型
   */
  questionTypeDesc?: null | string;
  /**
   * 正确答案
   */
  rightAnswer?: null | string;
  /**
   * 分数
   */
  scoreStr?: null | string;
  /**
   * 题目主题
   */
  themeName?: null | string;
  /**
   * 校验结果
   */
  validFail?: boolean | null;
}

export interface QuestionOptionVO {
  /**
   * 是否校验
   */
  isCheck?: boolean | null;
  /**
   * 是否正确
   */
  isRight?: boolean | null;
  /**
   * 选项Id
   */
  optionID?: null | string;
  /**
   * 选项标题
   */
  optionTitle?: null | string;
  /**
   * 序号
   */
  sort?: number | null;
}
