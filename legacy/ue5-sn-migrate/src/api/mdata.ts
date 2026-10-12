import request from "../service/request";
import { AreaType, ReturnAreaScenePanelConfig, SceneDataType } from "./models/mdata";
const baseURL = '/api/mdata/'
/**
 * @说明 获取菜单列表
 * @returns
 */
export function sceneTypePage<T extends Record<string, any>>(params?: T) {
    return request<SceneDataType[]>({
        url: baseURL + "scene-type/page",
        method: "GET",
        params,
    });
}
/**
 * 根据业务菜单及区域级别获取配置面板
 * 这里传的areaId是区域级别
 */
export function getAreaScenePanelConfig<T extends Record<string, any>>(params: T) {
    return request<ReturnAreaScenePanelConfig[]>({
        url: baseURL + `area-scene-config/panel/${params.areaLeave}/${params.sceneType}`,
        method: "GET"
    })
}
/**
 * 区域列表
 */
export function getAreaList<T extends Record<string, any>>(params?: T) {
    return request<AreaType[]>({
        url: baseURL + `area/list`,
        method: "GET",
        params
    })
}
/**
 * 区域列表
 */
export function getAreaDetails(id?: string) {
    return request({
        url: baseURL + `area/${id}`,
        method: 'GET',
    })
}

/**
 * 流媒体服务器配置详情
 */
export function mediaConfig<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: baseURL + `stream-media-config`,
        method: "GET",
        params
    })
}
/**
 * 获取登录会话信息
 */
export function loginSession<T extends Record<string, any>>(params?: T,headers?: T) {
    return request<any>({
        url: baseURL + `video-ptz/login-session`,
        method: "GET",
        params,
        headers
    })
}
/**
 * 获取流媒体配置
 */
export function getStreamMediaConfig<T extends Record<string,any>>(headers?:T){
    if (window.config.entry === 'views-shengNong') {
        return request({
            url:`${baseURL}/stream-media-configs`,
            method:"GET",
            headers
        })
    }else{
        return request({
            url:`${baseURL}/stream-media-configs`,
            method:"GET",
        })
    }
}

export function getTenant<T extends Record<string,any>>(params?:T){
  return request({
      url:`${baseURL}/tenant/mine`,
      method:"GET"
  })
}
export function getModelConfig<T extends Record<string,any>>(params?:T){
  return request({
      url:`/api/visualization/model-configuration`,
      method:"GET"
  })
}
// 根据模型编码获取档位详情
export function stallDetailVisualization(visualizationCode?:string){
  return request({
      url: baseURL+`/stall/detail/by-visualization/${visualizationCode}`,
      method:"GET"
  })
}
// 档位详情
export function stallDetailId(id?:string){
  return request({
      url: baseURL+`/stall/${id}`,
      method:"GET"
  })
}
// 档位分页列表查询(根据场景获取)
export async function stallSceneStall<T extends Record<string, unknown>> (params?: T): Promise<unknown> {
    return request({
      url: baseURL + '/stall-scene/stalls',
      method: 'get',
      params,
    })
  }
