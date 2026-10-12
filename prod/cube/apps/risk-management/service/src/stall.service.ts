import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/stall`

export interface GenStallPageRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  typeName: string;
  area: string;
  areaNames: string;
  location: string;
  builtUpArea: string;
  practicalArea: string;
  deptId: string;
  deptIds: string[];
  deptNames: string[];
  leaseType: boolean;
  remark: string;
  enabled: boolean;
  bimBind: boolean;
  costRuleCount?: string;
  updateTime: number;
}

export interface GenStallPage {
  total: number;
  pages: number;
  records: GenStallPageRecord[];
}

export class CubeStallService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 分页查询档位列表
  public async genStallPage (payload: {
    pageNumber: number;
    pageSize: number;
  }): Promise<GenStallPage> {
    const url = `${baseURL}/gen-stall/page`
    const resp = await this.gateway.get<LegacyServiceError<GenStallPage>>({ url, payload })
    return resp.data ||resp
  }
}
