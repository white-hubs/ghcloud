import { BASE_API } from '@ghcloud/cube-protocol'
import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import type { FormFlowInstance } from './type'
const baseURL = `${BASE_API}/attendance`
export class CubeAttendanceService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }
  /** 检查调换的班次是否符合要求 */
  public async postClassesChangeCheck (payload: Record<string, any>) {
    const url = `${baseURL}/att/exchange/check`
    const resp = await this.gateway.create<LegacyServiceError<FormFlowInstance>>({ url, payload })
    return resp.data || resp
  }
  /** 补卡检查（检查是否能够提交补卡 */
  public async postClockRepairCheck (payload: Record<string, any>){
    const url = `${baseURL}/att/approve/verification`
    const resp = await this.gateway.create<LegacyServiceError<FormFlowInstance>>({ url, payload })
    return resp.data || resp
  };
  /** 获取考勤统一提交接口 */
  public async attendanceApprovalSubmit (payload: Record<string, any>){
    const url = `${baseURL}/att/approval/submit`
    const resp = await this.gateway.create<LegacyServiceError<FormFlowInstance>>({ url, payload })
    return resp.data || resp
  };
};