import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { BroadcastPlayRecord } from './type'
const baseURL = `${BASE_API}/broadcast`
export interface AddBroadcastRule {
  devices: Device[];
  enabled: boolean;
  name: string;
  remark?: string;
  templates: Template[];
}

export interface Device {
  areaId?: string;
  areaName?: string;
  /**
   * 所属区域序列号
   */
  deviceAreaId?: string | undefined;
  /**
   * 区域名称
   */
  deviceAreaName?: string | undefined;
  /**
   * 设备主键
   */
  deviceId: string;
  /**
   * 设备名称
   */
  deviceName: string;
  /**
   * 产品品类编号
   */
  deviceProdCategoryCode: string;
  /**
   * 产品品类编号序列号
   */
  deviceProdCategoryCodeConcat: string;
  /**
   * 产品品类名称
   */
  deviceProdCategoryName: string;
  /**
   * 设备产品主键
   */
  deviceProdId: string;
  /**
   * 设备产品名称
   */
  deviceProdName: string;
}

export interface Template {
  /**
   * 模板内容
   */
  templateContent: string;
  /**
   * 模板主键
   */
  templateId: string;
  /**
   * 模板名称
   */
  templateName: string;
}
export interface BroadcastTemplatePage {
  id: string;
  name: string;
  content: string;
  contentType: string;
  defaulted: boolean;
  updateBy: string;
  updateByName: string;
  updateTime: number;
  fileVOList: {
    path: string;
    name: string;
    id: string;
  }[];
}
export interface BroadcastPlayRulePage {
  id: string;
  name: string;
  enabled: boolean;
  remark: string;
  defaulted?: boolean;
}
export class CubeBroadcastService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 广播记录 分页 */
  public async getBroadcastPlayRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    templateId?: string;
  }): Promise<{ records: BroadcastPlayRecord[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-play-record/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: BroadcastPlayRecord[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 广播模板分页
  public async broadcastTemplatePage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
    contentType?: string | undefined;
  }): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-template/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 广播记录分页
  public async broadcastPlayRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
  }): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-play-record/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 获取广播规则详情
  public async getBroadcastRuleInfo (id: string): Promise< AddBroadcastRule > {
    const url = `${baseURL}/broadcast-play-rule/${id}`
    const resp = await this.gateway.get<LegacyServiceError<AddBroadcastRule>>({ url })
    return resp.data ||resp
  }

  // 广播规则分页
  public async broadcastPlayRulePage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
  }): Promise<{ records: BroadcastPlayRulePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-play-rule/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: BroadcastPlayRulePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 删除广播模板
  public async deleteBroadcastTemplate (id: string): Promise<void> {
    const url = `${baseURL}/broadcast-template/${id}`
    await this.gateway.delete({ url })
  }

  // 删除广播模板
  public async deleteBroadcastPlayRule (id: string): Promise<void> {
    const url = `${baseURL}/broadcast-play-rule/${id}`
    await this.gateway.delete({ url })
  }

  // 新增广播模板
  public async broadcastTemplate (payload: {
    content: string;
    name: string;
  }): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-template`
    const resp = await this.gateway.create<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 新增广播规则
  public async addBroadcastRule (payload: AddBroadcastRule): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-play-rule`
    const resp = await this.gateway.create<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 编辑广播规则
  public async updateBroadcastRule (id: string, payload: AddBroadcastRule): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-play-rule/${id}`
    const resp = await this.gateway.update<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 编辑广播模板
  public async editBroadcast (id: string, payload: {
    content: string;
    name: string;
  }): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-template/${id}`
    const resp = await this.gateway.update<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url, payload })
    return resp.data ||resp
  }

  // 更新规则启用禁用
  public async broadcastPlayRuleEnabled (id: string, checked: boolean): Promise<{ records: BroadcastTemplatePage[]; total: number; pages: number; }> {
    const url = `${baseURL}/broadcast-play-rule/${id}/enabled/${checked}`
    const resp = await this.gateway.update<LegacyServiceError<{ records: BroadcastTemplatePage[]; total: number; pages: number; }>>({ url })
    return resp.data ||resp
  }

  /** 广播模板列表 */
  public async getBroadcastTemplates (keyword?: string): Promise<{
    'id': string;
    'name': string;
    'content': string;
    'defaulted': string;
  }[]> {
    const url = `${baseURL}/broadcast-templates?keyword=${keyword ?? ''}`
    const resp = await this.gateway.get<LegacyServiceError<{
      'id': string;
      'name': string;
      'content': string;
      'defaulted': string;
    }[]>>({ url })
    return resp.data ||resp
  }

  /** 广播文本播放 */
  public async broadcastPlayByNum (payload: {
    /**
     * 播放终端设备，为空时,默认为所有设备
     */
    broadcastPlayDevices?: {
      id: string;
      code: string;
      name: string;
      thirdPartyCode: string;
    }[];
    /**
     * 播放次数
     */
    broadcastPlayNum: number;
    /**
     * 广播模板参数
     */
    broadcastTemplateCidontentParam: {
      name: string;
      value: string;
    }[];
    /**
     * 模板主键
     */
    id: string;
  }): Promise<void> {
    const url = `${baseURL}/broadcast-play/text`
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
  }

  /** 广播文本循环播放 */
  public async broadcastPlayByCirculate (payload: {
    /**
       * 播放终端设备，为空时,默认为所有设备
       */
    broadcastPlayDevices?: {
      id: string;
      code: string;
      name: string;
      thirdPartyCode: string;
    }[];
    startTime: string;
    endTime: string;
    /**
       * 广播模板参数
       */
    broadcastTemplateCidontentParam: {
      name: string;
      value: string;
    }[];
    /**
       * 模板主键
       */
    id: string;
  }): Promise<void> {
    const url = `${baseURL}/broadcast-play/circulate/text`
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
  }
}
