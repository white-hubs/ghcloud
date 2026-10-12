import { request } from '@/service/index'
const baseUrl = '/maintain'
/** 系统配置 通用分类分页查询 */
export const getRecordPage = async (params: RecordType.FormState): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/task/queryRecordPage', { params: { ...params } })
}
/** 删除巡更任务(批量) */
export const taskRemoveBatch = async (data: { taskIdList: string[]; }): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/electron/task/remove-batch', data)
}
