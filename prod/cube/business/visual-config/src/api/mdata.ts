import request from '@/service/request'
import type { GetPropertyDetailedPage, GetSceneMenu, ReturnAreaScenePanelConfig, StallPage } from './models/mdata'
import type { PublishState } from '@/views/publish/publish-i'
import { useUtils } from '@/hooks/use-utils'
const baseUrl = '/api/mdata/'
export interface GetAreaList {
  id: string;
  parentId?: string ;
  level: number;
  children: GetAreaList[];
  name: string;
  code: string;
  sequence: string;
  aliasName: string;
  sort?: number;
  builtUpArea?: number | null;
  areaManagerId: string;
  areaDepartmentId: string;
  areaManagerIds: string[];
  areaManagerName: string[];
  visualizationAreaType: string | null;
}
export interface PictureFile {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  endpointPath: string;
  createTime: number;
}

export interface VideoFile {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  endpointPath: string;
  createTime: number;
}

export interface AreaExtend {
  id: string;
  introduce: string;
  pictureFiles: PictureFile[];
  videoFiles: VideoFile[];
}

export interface GetAreaDetails {
  id: string;
  level: number;
  name: string;
  code: string;
  sequence: string;
  aliasName: string;
  areaManagerId: string;
  areaDepartmentId: string;
  visualizationAreaType: string;
  areaExtend: AreaExtend;
}

/**
 * 获取业务菜单
 */
export async function getScenePage (params?: Record<string, unknown>): Promise<GetSceneMenu[]> {
  const { getProjectId } = useUtils()
  const projectId = getProjectId()
  params = params ?? {}
  params.projectId = projectId
  return request<GetSceneMenu[]>({
    url: baseUrl + 'scene-type/page',
    method: 'GET',
    params,
  })
}
/**
 * 添加业务菜单
 */
export async function addSceneMenu (data: Record<string, unknown>): Promise<string> {
  const { getProjectId } = useUtils()
  const projectId = getProjectId()
  data.projectId = projectId
  return request<string>({
    url: baseUrl + 'scene-type',
    method: 'POST',
    data
  })
}
/**
 * 修改业务菜单
 */
export async function editSceneMenu (data: Record<string, unknown>): Promise<string> {
  const { getProjectId } = useUtils()
  const projectId = getProjectId()
  data.projectId = projectId
  return request<string>({
    url: baseUrl + `scene-type/${data.id}`,
    method: 'PUT',
    data
  })
}
/**
 * 删除业务菜单
 */
export async function deleteSceneMenu<T extends Record<string, unknown>> (params: T): Promise<string> {
  return request<string>({
    url: baseUrl + `scene-type/${params.id}`,
    method: 'DELETE',
  })
}
/**
 * 删除档位关联
 */
export async function deleteStallSceneConfig<T extends Record<string, unknown>> (params: T, data: { businessIds: string[] | string[]; projectId: string; }): Promise<string> {
  return request<string>({
    url: baseUrl + `/stall-scene-config/${params.sceneType}/delete/stalls`,
    method: 'DELETE',
    data
  })
}
/**
 * 删除资产关联
 */
export async function deletePropertySceneConfig (data: { ids: string[] | string[]; }): Promise<string> {
  return request<string>({
    url: '/api/property/property/bim/config/delete',
    method: 'DELETE',
    data
  })
}
/**
 * 删除风险源关联
 */
export async function deleteRiskSceneConfig (data: { ids: string[] | string[]; }): Promise<string> {
  return request<string>({
    url: '/api/property/risk/source/bim/config/delete',
    method: 'DELETE',
    data
  })
}
/**
 * 区域场景面板配置列表
 */
export async function getAreaScenePanelConfig<T extends Record<string, unknown>> (params: T): Promise<ReturnAreaScenePanelConfig[]> {
  return request<ReturnAreaScenePanelConfig[]>({
    url: baseUrl + `area-scene-config/panel/${params.areaId}/${params.sceneType}`,
    method: 'GET'
  })
}
/**
 * 区域场景面板配置
 */
export async function postAreaSceneConfig<T extends Record<string, unknown>> (data: T): Promise<string> {
  return request<string>({
    url: baseUrl + 'area-scene-config/panel/disposable-save',
    method: 'POST',
    data
  })
}
// 区域管理接口 - 区域列表(区域管理)
export async function getAreaList <T extends Record<string, unknown>> (params?: T): Promise<GetAreaList[]> {
  return request({
    url: baseUrl + 'area/list',
    method: 'get',
    params,
  })
}
// 档位类型接口

export async function stallCategoryList <T extends Record<string, unknown>> (params?: T): Promise<unknown[]> {
  return request({
    url: baseUrl + 'stall-category/list',
    method: 'get',
    params,
  })
}
// 档位列表接口
export async function stallPage<T extends Record<string, unknown>> (params?: T): Promise<StallPage> {
  return request({
    url: baseUrl + '/stall-scene/not-bind/stalls',
    method: 'get',
    params,
  })
}
// 资产类型接口
export async function getAssemblyClassifyPage<T extends Record<string, unknown>> (params?: T): Promise<StallPage> {
  return request({
    url: '/api/property/classify/getAssemblyClassifyPage',
    method: 'get',
    params,
  })
}
// 风险源查询列表接口
export async function riskSourceLedgerPage<T extends Record<string, unknown>> (params?: T): Promise<StallPage> {
  return request({
    url: '/api/property/risk/source/ledgerByBimSceneType/page',
    method: 'get',
    params,
  })
}
// 资产清单分页接口
export async function getPropertyDetailedPage<T extends Record<string, unknown>> (params?: T): Promise<GetPropertyDetailedPage> {
  return request({
    url: '/api/property/property/detailed/getPropertyDetailedPage',
    method: 'get',
    params,
  })
}
// 档位分页列表查询(根据场景获取)
export async function stallSceneStall<T extends Record<string, unknown>> (params?: T): Promise<StallPage> {
  return request({
    url: baseUrl + '/stall-scene/stalls',
    method: 'get',
    params,
  })
}
// 资产分页列表查询(根据场景获取)
export async function propertySceneStall<T extends Record<string, unknown>> (params?: T): Promise<GetPropertyDetailedPage> {
  return request({
    url: '/api/property/property/bim/config/page',
    method: 'get',
    params,
  })
}
// 风险源分页列表查询(根据场景获取)
export async function riskSceneStall<T extends Record<string, unknown>> (params?: T): Promise<GetPropertyDetailedPage> {
  return request({
    url: '/api/property/risk/source/bim/config/page',
    method: 'get',
    params,
  })
}

/**
 * 查询我的所有项目
 */
export const getProjectAll = async (): Promise<Service.RequestResult> => {
  return request({
    url: '/api/visualization/project/queryProjectAll',
    method: 'GET'
  })
}
/**
 * 新增项目
 */
export const addProject = async (data: {
  projectName: string | null;
  title: string | null;
  entry: string | null;
}): Promise<Service.RequestResult> => {
  return request({
    url: '/api/visualization/project/insert',
    method: 'POST',
    data
  })
}

export const updateProject = async (data: {
  projectName: string | null;
  title: string | null;
  entry: string | null;
  id?: string | null;
}): Promise<Service.RequestResult> => {
  return request({
    url: '/api/visualization/project/update',
    method: 'PUT',
    data
  })
}
/**
 * 删除项目
 */
export const deleteProject = async (data: {
  id: string;
}): Promise<Service.RequestResult> => {
  return request({
    url: `/api/visualization/project/${data.id}`,
    method: 'DELETE'
  })
}

/**
 * 发布管理分页
 */
export const getInstancePage = async (params: {
  status: string | null;
  projectName: string | null;
  pageSize: number | null;
  pageNumber: number | null;
  total?: number | null;
}): Promise<{ pages: number; records: PublishState[]; total: number; }> => {
  return request({
    url: '/api/visualization/instance/queryInstancePage',
    method: 'GET',
    params,
  })
}
/**
 * 新增
 */
export const addInstancePage = async (data: {
  projectId: string | null;
  instanceName: string | null;
}): Promise<Service.RequestResult> => {
  return request({
    url: '/api/visualization/instance/insert',
    method: 'POST',
    data
  })
}
/**
 * 档位新增关联菜单
 */
export const addStallSceneConfig = async (data: {
  sceneType: string | undefined;
  categoryId?: string | undefined;
  keyword?: string | undefined;
  stallBindWay: string | undefined;
  businessIds: string[] | undefined;
}): Promise<string> => {
  return request({
    url: baseUrl + 'stall-scene-config',
    method: 'POST',
    data
  })
}
/**
 *资产新增关联菜单
 */
export const addPropertySceneConfig = async (data: {
  sceneType: string | undefined;
  categoryId?: string | undefined;
  keyword?: string | undefined;
  bindWay: string | undefined;
  businessIds: string[] | undefined;
}): Promise<string> => {
  return request({
    url: '/api/property/property/bim/config/insert',
    method: 'POST',
    data
  })
}
/**
 *风险源新增关联菜单
 */
export const addRiskSceneConfig = async (data: {
  sceneType: string | undefined;
  categoryId?: string | undefined;
  keyword?: string | undefined;
  bindWay: string | undefined;
  businessIds: string[] | undefined;
}): Promise<string> => {
  return request({
    url: '/api/property/risk/source/bim/config/insert',
    method: 'POST',
    data
  })
}
export const updateInstancePage = async (data: {
  id: string | null;
  projectId: string | null;
  instanceName: string | null;
  status?: string | null;
}): Promise<Service.RequestResult> => {
  return request({
    url: '/api/visualization/instance/update',
    method: 'PUT',
    data
  })
}

/**
 * 区域详情
 */
export const getAreaDetails = async (id: string): Promise<GetAreaDetails> => {
  return request({
    url: baseUrl + `area/${id}`,
    method: 'GET',
  })
}

