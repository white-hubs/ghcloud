import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/`

export class CubeTypeService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 获取类型
  public async getType (payload: Record<string, string | boolean | number>): Promise<any> {
    const url = `${baseURL}/dictionary/getCascadeDictionaryItem`
    const res = await this.gateway.get({ url, payload })
    return res
  }

  // 添加类型
  public async addType (payload: { name: string;remarks: string; }): Promise<any> {
    const url = '/api/dictionary/addCascadeDictionary'
    const res = await this.gateway.create({ url, payload })
    return res
  }

  // 修改类型
  public async putType (payload: any): Promise<void> {
    const url = `${baseURL}dictionary/updateCascadeDictionary`
    await this.gateway.update({ url, payload })
  }

  // 删除类型
  public async deleteType (id: string): Promise<void> {
    const url = `${baseURL}dictionary/deleteCascadeDictionary/${id}`
    await this.gateway.delete({ url })
  }
}
