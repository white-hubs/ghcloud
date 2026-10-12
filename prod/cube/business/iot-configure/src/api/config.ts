import { request } from '@/service'

/** 获取全局配置 */
export const getGlobalConfig = async (): Promise<Service.RequestResult> => {
  return request.get('/gateway/detailOfDynamicReportStrategy', {
    params: {
    }
  })
}

/** 全局配置保存 */
export const saveGlobalConfig = async (data: {
  changeUpVal: number | undefined;
  intervalReportMill: number | undefined;
  reportStrategy: string | undefined;
}): Promise<Service.RequestResult> => {
  return request.post('/gateway/saveOrUpdateDynamicReportStrategy', data)
}
