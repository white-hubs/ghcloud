import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/stall`;
const baseFlowURL = `${BASE_API}/flow`;
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

export interface FaultCaseCategoryTree {
  categoryCode: string;
  categoryName: string;
  deviceNum: number;
  children: FaultCaseCategoryTree[];
}

export class CubeFaultRepairService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  // 分页查询档位列表
  public async genStallPage(payload: { pageNumber: number; pageSize: number }): Promise<GenStallPage> {
    const url = `${baseURL}/gen-stall/page`;
    const resp = await this.gateway.get<LegacyServiceError<GenStallPage>>({ url, payload });
    return resp.data || resp;
  }

  // 分页查询档位列表
  public async genFlowNumber(payload: {
    applicationCode?: string;
    period?: string;
    businessType?: string;
  }): Promise<{ waitingCount: number; finishedCount: number; submitCount: number }> {
    const url = `${baseFlowURL}/statistics/user/flow/number`;
    const resp = await this.gateway.get<LegacyServiceError<{ waitingCount: number; finishedCount: number; submitCount: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  public async genFaultCaseDeviceTypeList(): Promise<FaultCaseCategoryTree[]> {
    const url = "/api/maintain/fault-case/device-type/list?keyword=&applicationCode=FAULT";
    const resp = await this.gateway.get<LegacyServiceError<FaultCaseCategoryTree[]>>({ url });
    return resp.data || resp;
  }

  // 个人发起工单统计
  public async getWordOrderStatisticsByUser(payload: {
    pageNumber: number;
    pageSize: number;
    applicationCode: string;
    period: string;
  }): Promise<{ pages: number; total: number; records: [] }> {
    const url = "/api/flow/getWordOrderStatisticsByUser";
    const resp = await this.gateway.get<{ pages: number; total: number; records: [] }>({ url, payload });
    return resp;
  }

  // 根据业务类型获取当前表单流程节点名称
  public async getFlowBusinessNodeNames(payload: { businessType: string }): Promise<string[]> {
    const url = "/api/flow/form-flow-business/node/name";
    const resp = await this.gateway.get<LegacyServiceError<string[]>>({ url, payload });
    return resp.data || resp;
  }
}
