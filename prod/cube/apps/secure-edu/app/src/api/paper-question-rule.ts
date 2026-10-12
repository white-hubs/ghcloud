import { Delete, Get, Post, Put, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { PaperQuestionRuleRow, PaperQuestionRuleSaveCommand } from '@/types/paper-question-rule'

const baseUrl = '/safety-education'

/** 随机考题规则列表 */
export const getPaperQuestionRuleList = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult | PaperQuestionRuleRow[]>> => {
  return Get(baseUrl + '/exam-question-rule/list', { params })
}

/** 随机考题规则下拉选项 */
export const getPaperQuestionRuleOptionList = async (): Promise<BaseAPIResult<{ id: string; ruleName: string; }[]>> => {
  return Get(baseUrl + '/exam-question-rule/option-list')
}

/** 随机考题规则详情 */
export const getPaperQuestionRuleDetail = async (id: string): Promise<BaseAPIResult<PaperQuestionRuleRow>> => {
  return Get(baseUrl + `/exam-question-rule/detail/${id}`)
}

/** 新增随机考题规则 */
export const createPaperQuestionRule = async (params: PaperQuestionRuleSaveCommand): Promise<BaseAPIResult> => {
  return Post(baseUrl + '/exam-question-rule/create', params)
}

/** 编辑随机考题规则 */
export const changePaperQuestionRule = async (params: PaperQuestionRuleSaveCommand): Promise<BaseAPIResult> => {
  return Put(baseUrl + '/exam-question-rule/change', params)
}

/** 删除随机考题规则 */
export const removePaperQuestionRule = async (id: string): Promise<BaseAPIResult> => {
  return Delete(baseUrl + `/exam-question-rule/remove/${id}`)
}
