import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}`

export interface FileState {
  businessKey?: string | null;
  id: string;
  ossId?: string | null;
  name?: null | string;
  path?: null | string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}

export class CubeFileService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** ID查询文件 */
  public async getFileInfo (id: string): Promise<FileState> {
    const url = `${baseURL}/file/file/${id}`
    const resp = await this.gateway.get<LegacyServiceError<FileState>>({ url })
    return resp.data || resp
  }

  /** 文件删除 */
  public async deleteFile (id: string): Promise<void> {
    const url = `${baseURL}/file/file/${id}`
    await this.gateway.delete({ url })
  }

  /** 上传文件 */
  public async uploadFile (payload: {
    businessKey: string;
    tenant?: string;
    tag?: string;
    file?: Blob | null;
    watermark?: string;
    sceneCode?: string;
    useTemporary?: boolean;
  }): Promise<FileState> {
    const useUploadTemporary = (payload.useTemporary ?? window?.config?.feature?.useUploadTemporary) && payload.sceneCode
    const url = useUploadTemporary ? `${baseURL}/file/upload/temporary` : `${baseURL}/file/file`
    const form = new FormData()
    form.append('businessKey', payload.businessKey)
    if (payload.sceneCode) form.append('sceneCode', payload.sceneCode)
    if (payload.tenant) form.append('tenant', payload.tenant)
    if (payload.tag) form.append('tag', payload.tag)
    if (payload.file) form.append('file', payload.file)
    if (payload.watermark) form.append('watermark', payload.watermark)
    const resp = await this.gateway.custom<FileState>({
      url,
      payload: form,
      method: 'POST'
    })
    return resp
  }

  /** 文件持久化 */
  public async persistFile (sceneCode: string, fileIdList: number[] | string[]): Promise<void> {
    const url = `${baseURL}/file/induce/single/body`
    await this.gateway.custom<void>({
      url,
      payload: {
        sceneCode,
        fileIdList
      },
      method: 'POST'
    })
  }

  /** 查询所有场景 */
  public async getSceneInfo (): Promise<unknown> {
    const url = `${baseURL}/file/get/scene/info/all`
    return this.gateway.get<LegacyServiceError<unknown>>({ url })
  }

  /** 查询文件清理策略 */
  public async getExpirationPolicyPage (payload: {
    pageSize: number;
    pageNumber: number;
    sceneCode?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/file//get/expiration/policy/page`
    return this.gateway.get<LegacyServiceError<unknown>>({ url, payload })
  }

  // 新增文件清理策略
  public async addExpirationPolicy (payload: {
    sceneCode: string;
    expirationPolicy: string;
    configInfo: string;
  }): Promise<unknown> {
    const url = `${baseURL}/file/add/expiration/policy`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({
      url, payload
    })
    return resp.data || resp
  }

  // 编辑文件清理策略
  public async editExpirationPolicy (payload: {
    sceneCode: string;
    expirationPolicy: string;
    configInfo: string;
  }): Promise<unknown> {
    const url = `${baseURL}/file/update/expiration/policy`
    return this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
  }

  // 删除文件清理策略
  public async delExpirationPolicy (id: string): Promise<void> {
    const url = `${baseURL}/file/delete/expiration/policy/${id}`
    await this.gateway.delete({ url })
  }
}
