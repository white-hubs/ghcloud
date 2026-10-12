import { LineLossDevicePage, LineLossList, LineLossPage, OrUpdateDetail, PageResult } from "./types";
import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/securitymanagement`;

export class CubeLineLossManagementService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 关联线损采集记录 */
  public async getSecurityDevicePage(params: {
    startTime: string;
    pageSize: number;
    pageNumber: number;
    endTime: string;
    deviceIdSet: string[];
  }): Promise<{ total: number; records: LineLossDevicePage[]; pages: number }> {
    const url = `${baseURL}/lineLoss/read/page`;
    const resp = await this.gateway.get<{ total: number; records: LineLossDevicePage[]; pages: number }>({
      url,
      payload: params,
    });
    return resp;
  }

  /** 分页查询线损统计 */
  public async getLineLossPage(params: {
    startTime: string;
    pageSize: number;
    pageNumber: number;
    endTime: string;
    lineName?: string;
  }): Promise<{ total: number; records: LineLossPage[]; pages: number }> {
    const url = `${baseURL}/lineLoss/stat/page`;
    const resp = await this.gateway.get<{ total: number; records: LineLossPage[]; pages: number }>({
      url,
      payload: params,
    });
    return resp;
  }
  /** 采集周期保存 */
  public async saveOrUpdate(params: { id?: string; periodType: string; days?: string; hourTime?: string }): Promise<boolean> {
    const url = `${baseURL}/lineloss/collectConfig/edit`;
    const resp = await this.gateway.create<boolean>({
      url,
      payload: params,
    });
    return resp;
  }

  /** 采集周期详情 */
  public async getOrUpdate(): Promise<OrUpdateDetail> {
    const url = `${baseURL}/lineloss/collectConfig/detail`;
    const resp = await this.gateway.get<OrUpdateDetail>({
      url,
    });
    return resp;
  }

  /** 分页查询线损线路 */
  public async getLineLossList(): Promise<PageResult<LineLossList>> {
    const url = `${baseURL}/lineLoss/connection/page`;
    const resp = await this.gateway.get<PageResult<LineLossList>>({
      url,
    });
    return resp;
  }
}
