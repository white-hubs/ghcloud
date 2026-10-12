import { request } from '@/service/index'
const base = '/visualization'
/**
 *
 * @param id 项目id
 * @returns 接口响应数据
 */
interface QueryParams {
  instanceId: string;
  projectId: string;
}
export const getCanvasConfigInfo = async (params: QueryParams): Promise<Service.RequestResult> => {
  return request.get(base + '/project/canvas/queryCanvas/', { params })
}
export const projectUpdate = async (data: { thumbnail?: string;canvasJson: string; projectId: string;modelIds?: string; }): Promise<Service.RequestResult> => {
  return request.put(base + '/project/canvas/update', data)
}
/**
 * 查询所有模型
 * @param params 模型类型参数
 * @returns 所有模型数据
 */

export const getAllModel = async (params: {
  modelType: string;
}): Promise<Service.RequestResult> => {
  return request.get(base + '/model/queryAll', { params })
}
export const get2dModelById = async (params: {
  modelId: string;
}): Promise<Service.RequestResult> => {
  return request.get(base + '/model/route/queryAll', { params })
}
export const get2dConfigurationByPage = async (params: { modelType: string;pageSize: string | number; pageNumber: string | number; }): Promise<Service.RequestResult> => {
  return request.get(base + '/model/queryPage', { params })
}
