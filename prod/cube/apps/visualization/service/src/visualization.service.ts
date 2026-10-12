import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}`

export interface VisualProject {
  id: string ;
  projectName: string;
  canvas: string;
  mainStructure: string;
}
export interface ModelType{
  id: number;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey: number;
  endpointPath: string;
  createTime: string;
}
export interface ModelType {
  id: number;
  projectId: string;
  name: string;
  modelUrl?: string;
  areaId: string;
  areaName: string;
  modelStructure?: string;
  sceneTypeId?: string;
  sceneTypeName?: string;
  sceneUrl?: string;
  modelFile?: ModelFormType;
  sceneImg?: ModelFormType;
}
export interface ModelFormType{
  id?: number;
  projectId: string;
  name?: string;
  modelUrl?: string;
  areaId: string;
  sceneTypeId?: string;
  modelFile?: number;
  sceneUrl?: number;
  sceneImg?: number;
  modelStructure?: string;
}

/** 可视化配置服务 */
export class CubeVisualizationService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 查询当前租户可视化项目 */
  public async getVisualProjectList (): Promise<VisualProject[]> {
    const url = `${baseURL}/visualization/project/queryProjectAll`
    const resp = await this.gateway.get<LegacyServiceError<VisualProject[]>>({ url })
    return resp.data||resp
  }

  public async copyProject (productId: string): Promise<void> {
    const url = `${baseURL}/visualization/project/copy/${productId}`
    await this.gateway.create<LegacyServiceError<void>>({ url })
  }

  public async getModalConfigByProjectId (productId: string): Promise<string> {
    const url = `${baseURL}/visualization/model-configuration?projectId=${productId}`
    const resp =  await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({ url })
    const data = resp.data || resp
    return data.modelConfiguration as string
  }

  /**
   * 查询模型配置
   */

  public async getModelFormArea (params: {
  projectId: string | null;
  areaId?: string | null| undefined;
}): Promise<ModelType[]> {
    const url = `${baseURL}/visualization/model/scene/list?projectId=${params.projectId}&&areaId=${params.areaId??''}`
    const resp =  await this.gateway.get<ModelType[]>({ url })
    return resp
  }  
  /**
   * 更新模型配置
   */

  public async postModelFormArea (payload: {
      id?: number;
    projectId: string;
    name?: string;
    modelUrl?: string;
    areaId: string;
    sceneTypeId?: string;
    modelFile?: number;
    sceneUrl?: number;
    sceneImg?: number;
    modelStructure?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/visualization/model/scene/save/or/update`
    return this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
  } 


  /**
   * 自动关联模版获取
   */

  public async getModelTemplate (): Promise<Blob> {
    const url = `${baseURL}/visualization/model/scene/auto/relate/template`
    const resp =  await this.gateway.customBlob({ method: 'GET', url })
    return resp
  }  
}
