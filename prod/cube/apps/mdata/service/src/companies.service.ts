import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}`

// 批发商
export class CubeCompaniesService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 档位-批发商详情 */
  public async getCompaniesDetailByStall (payload: {
    stallId: string;
  }): Promise<unknown> {
    const url = `${baseURL}/project-merchant/companies/stallId`
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
}
