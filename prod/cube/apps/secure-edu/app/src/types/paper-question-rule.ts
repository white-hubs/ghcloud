export interface PaperQuestionRuleRow {
  id: string;
  ruleName: string;
  totalScore: number;
  passScore: number;
  questionNum: number;
  description: string;
  editTime?: string;
  updateTime?: string;
  updatedAt?: string;
  items?: PaperQuestionRuleItem[];
}

export interface PaperQuestionRuleItem {
  id?: string;
  ruleId?: string;
  themeKeywords: string;
  examQuestionType: ExamQuestionTypeEnum;
  extractCount: number | undefined;
  perScore: number | undefined;
}

export enum ExamQuestionTypeEnum {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  JUDGE = 'JUDGE',
}

export interface PaperQuestionRuleSaveCommand {
  id?: string;
  ruleName: string;
  passScore: number | undefined;
  description?: string;
  items: PaperQuestionRuleItem[];
}
