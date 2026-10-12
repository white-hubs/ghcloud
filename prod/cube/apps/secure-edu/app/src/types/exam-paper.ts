export interface ExamPageRow {
  /**
   * 试卷题目数量
   */
  examPaperQuestionNumber: number;
  /**
   * 主键
   */
  id?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 及格分
   */
  passingGradeScore: number | null;
  /**
   * 试卷描述
   */
  remark: string;
  /**
   * 总分
   */
  score: number | undefined;
}

export interface InsertExamPapaer {
  /**
     * 试卷名称
     */
  name: string;
  /**
     * 及格分
     */
  passingGradeScore: number | undefined;
  /**
     * 大题分类
     */
  questionCategories: QuestionCategory[];
  /**
     * 试卷说明
     */
  remark?: string;
  /**
     * 总分
     */
  score: number | undefined;
}

export interface QuestionCategory {
  /**
   * 题目集合
   */
  examQuestions: ExamQuestion[];
  /**
   * 大题序号
   */
  sort: number;
  /**
   * 大题标题
   */
  title: string;
}

export interface ExamQuestion {
  /**
   * 答案解析
   */
  answerAnalysis?: string;
  /**
   * 题目名称
   */
  name: string;
  /**
   * 题目内容，表单json信息
   */
  questionContent: string;
  /**
   * 题目类型
   */
  questionType: string;
  /**
   * 题目分数
   */
  score: number;
  /**
   * 序号
   */
  sort: number;
  /**
   * 题目主题
   */
  themeId: string;
  /**
   * 题目主题名称
   */
  themeName: string;
}
