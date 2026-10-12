import request from '@/service/request'
import type { ModelList, RouteList, RecordType } from './models/mdata'
import type { LocationQueryValue } from 'vue-router'
import { useUtils } from '@/hooks/use-utils'
import { CubeVisualizationService } from '@ghcloud/cube-visualization-service'
import { authStore } from './auth-store'

const baseUrl = '/api/visualization'
const baseUrldic = '/api/dictionary/'
export async function getRoutePage<T extends Record<string, unknown>> (params?: T | undefined): Promise<RouteList[]> {
  return request({
    url: baseUrl + '/model/route/queryAll',
    method: 'GET',
    params,
  })
}
export async function getModelPage<T extends Record<string, unknown>> (params?: T | undefined): Promise<ModelList> {
  return request({
    url: baseUrl + '/model/queryPage',
    method: 'GET',
    params,
  })
}
export async function addRoutePage<T extends Record<string, unknown>> (data?: T | undefined): Promise<T> {
  return request({
    url: baseUrl + '/model/route/insert',
    method: 'POST',
    data,
  })
}
export async function addModelPage<T extends Record<string, unknown>> (data?: T | undefined): Promise<T> {
  return request({
    url: baseUrl + '/model/insert',
    method: 'POST',
    data,
  })
}
export async function putRoutePage<T extends Record<string, unknown>> (data?: T | undefined): Promise<T> {
  return request({
    url: baseUrl + '/model/route/update',
    method: 'put',
    data,
  })
}
export async function putModelPage<T extends Record<string, unknown>> (data?: T | undefined): Promise<T> {
  return request({
    url: baseUrl + '/model/update',
    method: 'PUT',
    data,
  })
}
export async function getModelPageById (id: LocationQueryValue | LocationQueryValue[]): Promise<RecordType> {
  return request({
    url: baseUrl + `/model/${id}`,
    method: 'GET',

  })
}
export async function deleteRoutePageById (id: string): Promise<[]> {
  return request({
    url: baseUrl + `/model/route/${id}`,
    method: 'delete',

  })
}
export async function deleteModelPageById (id: string): Promise<[]> {
  return request({
    url: baseUrl + '/model/' + id,
    method: 'delete',

  })
}
export async function insertAreaAll (id: LocationQueryValue | LocationQueryValue[]): Promise<[]> {
  return request({
    url: baseUrl + '/model/route/insertAreaAll',
    method: 'get',
    params: {
      modelId: id
    }
  })
}
export async function getSysDictionaryByItem (): Promise<[]> {
  return request({
    url: baseUrldic + '/getSysDictionaryByItem',
    method: 'get',
    params: {
      itemCode: 'visualization-modelType'
    }

  })
}
// 导入模型
export async function addModel<T extends Record<string, unknown>> (data: Record<string, unknown>): Promise<T> {
  const { getProjectId } = useUtils()
  const projectId = getProjectId()
  data.projectId = projectId
  return request({
    url: baseUrl + '/add-model-configuration',
    method: 'POST',
    data,
  })
}
// 模型查询
export async function getModelConfig (): Promise<{ modelConfiguration: string; }> {
  const { getProjectId } = useUtils()
  const projectId = getProjectId()
  return request({
    url: baseUrl + '/model-configuration?projectId=' + projectId,
    method: 'GET',
  })
}


/** 查询默认项目里面的UE模型配置 */
export async function getDefaultProjectUEServerUrl (): Promise<string | null> {
  const cubeVisualizationService = new CubeVisualizationService(authStore)
  const projectList = await cubeVisualizationService.getVisualProjectList()
  if (projectList.length === 0){
    return null
  }
  await cubeVisualizationService.getModalConfigByProjectId(projectList[0].id)
  return ''
}