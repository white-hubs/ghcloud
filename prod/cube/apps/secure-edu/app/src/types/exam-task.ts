import type { QuestionCategory } from './exam-paper'
import type { QuestionTypeEnum } from './question'
import type { CultivateTaskMarket } from './training-task'

export interface ExamTaskRow {
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
  examPaperId: string;
  /**
   * 考试开始时间
   */
  examStartTime: string;
  /**
   * 考试类型
   */
  examTaskType: ExamTaskType;
  /**
   * 考试人数
   */
  examUserNumber: number;
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

/**
* 考试类型
*/
export enum ExamTaskType {
  MERCHANT_EXAM = 'MERCHANT_EXAM',
  STAFF_EXAM = 'STAFF_EXAM',
}
export const ExamTaskTypeOptions = [
  { label: '员工考核', value: ExamTaskType.STAFF_EXAM },
  { label: '商户考核', value: ExamTaskType.MERCHANT_EXAM },
]

/** 试卷形式 */
export enum ExamPaperType {
  UNIFIED = 'UNIFIED',
  RANDOM = 'RANDOM',
}
export const ExamPaperTypeOptions = [
  { label: '统一题目', value: ExamPaperType.UNIFIED },
  { label: '随机出题', value: ExamPaperType.RANDOM },
]

export interface ExamUser {
  /**
   * 用户部门主键
   */
  departmentId: string;
  /**
   * 用户部门名称
   */
  departmentName: string;
  /**
   * 用户主键
   */
  id: string;
  /**
   * 用户姓名
   */
  name: string;
  /**
   * 用户电话
   */
  phone: string;
  /**
   * 用户岗位主键
   */
  postId: string;
  /**
   * 用户岗位名称
   */
  postName: string;
}

/** 考试任务状态枚举 */
export enum ExamTaskStatus {
  /** 已结束 */
  ENDED = 'ENDED',
  /** 进行中 */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 待考试 */
  STAY_EXAM = 'STAY_EXAM',
  /** 待发布 */
  UNPUBLISHED = 'UNPUBLISHED',
}
export const ExamTaskStatusOptions = [
  { label: '待发布', value: ExamTaskStatus.UNPUBLISHED },
  { label: '待考试', value: ExamTaskStatus.STAY_EXAM },
  { label: '进行中', value: ExamTaskStatus.IN_PROGRESS },
  { label: '已结束', value: ExamTaskStatus.ENDED },
]

export interface InsertExamTask {
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
  examPaperIds: string[];
  /**
   * 试卷形式
   */
  examPaperMode?: ExamPaperType;
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
  examTaskMarkets: CultivateTaskMarket[];
}

export interface ExamTaskPaperDetail {
  examQuestions: ExamTaskPaperExamQuestion[];
  /**
   * 主键
   */
  id: string;
  /**
   * 试卷名称
   */
  name: string;
  /**
   * 及格分
   */
  passingGradeScore: number;
  /**
   * 大题分类
   */
  questionCategories: QuestionCategory[];
  /**
   * 试卷说明
   */
  remark?: string;
  /**
   * 试卷总分
   */
  score: number;
}

interface ExamTaskPaperExamQuestion {
  /**
   * 答案解析
   */
  answerAnalysis: string;
  /**
   * 试卷大题分类主键
   */
  examPaperQuestionCategoryId: string;
  /**
   * 试卷大题分类名称
   */
  examPaperQuestionCategoryTitle: string;
  id: string;
  /**
   * 题目名称
   */
  name: string;
  /**
   * 题目内容
   */
  questionContent: string;
  /**
   * 题目类型
   */
  questionType: QuestionTypeEnum;
  /**
   * 题目类型名称
   */
  questionTypeName: string;
  /**
   * 分数
   */
  score: number;
  /**
   * 序号
   */
  sort: number;
  /**
   * 主题主键
   */
  themeId: string;
  /**
   * 主题名称
   */
  themeName: string;
}
