import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'

/** 查询字典 */
export const getCascadeDictionaryItem = async (itemCode: string): Promise<BaseAPIResult<{ name: string;code: string;variable: string; }[]>> => {
  return Get('/dictionary/getCascadeDictionaryItem?itemCode=' + itemCode)
}
/** 根据字典项编码查询字典值分页 */
export const getDataDictionaryByItemPage = async (itemCode: string): Promise<BaseAPIResult<{ records: { name: string;code: string;variable: string; }[]; }>> => {
  return Get('/dictionary/getDataDictionaryByItemPage?itemCode=' + itemCode)
}