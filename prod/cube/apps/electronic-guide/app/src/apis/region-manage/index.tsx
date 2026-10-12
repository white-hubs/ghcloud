import { request } from '@/service/index'
const baseUrl = '/electron-guide'
export interface AreaVo {
  id: string;
  parentId: string | null;
  level: number;
  children: AreaVo[];
  name: string;
  coordinate: string;
  zoom: string;
  createTime: number;
  sequence: string;
  sort: number;
  state: string;
}
export async function getAreaList (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/guide/area/page', { params })
}
export async function getAreaListTree (): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/guide/area/tree')
}
export async function createArea (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/guide/area/add', data)
}
export async function getAreaInfo (id: string): Promise<Service.RequestResult> {
  return request.get(baseUrl + `/public/guide/area/${id}`)
}
export async function updateArea (data: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + '/guide/area/update', data)
}
export async function deleteArea (id: string): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/guide/area/${id}`)
}
