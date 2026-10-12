export interface QuestionItem {
  /** 选项序号 */
  sort: number;
  /** 选项ID 字母 */
  ['optionID']: string;
  /** 选项标题 */
  optionTitle: string;
  /** 正确选项 */
  isRight: boolean;
  /** 用户是否选择 */
  isCheck: boolean;
}

/**
* 题目类型
*/
export enum QuestionTypeEnum {
  JUDGE = 'JUDGE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
}

/** 考题数据 一条 */
export interface QuestionRow {
  /**
   * 答案解析
   */
  answerAnalysis?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 题目内容，存表单json
   */
  questionContent: string;
  /**
   * 题目类型
   */
  questionType: QuestionTypeEnum;
  /**
   * 分数
   */
  score: string | number;
  /**
   * 主题id
   */
  themeId: string | undefined;
  id?: string;
}

/** 课件数据 */
export interface CoursewareRow {
  /**
   * 文件主键
   */
  fileId: string;
  /**
   * 课件名称
   */
  name: string;
  /**
   * 课件描述
   */
  remark?: string;
  duration: number;
  /**
   * 主题主键
   */
  themeId: string | undefined;
}
