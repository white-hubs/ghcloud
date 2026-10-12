import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { BorrowRecordPageVO, TidyUpStatisticsPageVO, WorkRecordPageVO } from './types'

const baseURL = `${BASE_API}/library-management`

/** 图书管理服务 */
export class CubeBooksManagementService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 操作员工作量 分页 */
  public async getWorkRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
    type?: string;
  }): Promise<{ records: WorkRecordPageVO[]; total: number; }> {
    const url = `${baseURL}/library/tidyUp/tidyUpRecordPage`
    const resp = await this.gateway.get<LegacyServiceError<{ records: WorkRecordPageVO[]; total: number; }>>({ url, payload })
    return resp.data ||resp
  }

  /** 借阅记录 分页 */
  public async getBorrowRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
    status?: string;
  }): Promise<{ records: BorrowRecordPageVO[]; total: number; }> {
    const url = `${baseURL}/library/borrow/borrowRecordPage`
    const resp = await this.gateway.get<LegacyServiceError<{ records: BorrowRecordPageVO[]; total: number; }>>({ url, payload })
    return resp.data ||resp
  }

  /** 编目整理统计 分页 */
  public async getTidyUpStatisticsPage (payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    name?: string;
    status?: string;
  }): Promise<{ records: TidyUpStatisticsPageVO[]; total: number; }> {
    const url = `${baseURL}/library/tidyUp/tidyUpStatisticsPage`
    const resp = await this.gateway.get<LegacyServiceError<{ records: TidyUpStatisticsPageVO[]; total: number; }>>({ url, payload })
    return resp.data ||resp
  }

  /** 编目整理统计 分页 */
  public async getBooksTypeList (payload?: {
    code?: string;
    id?: string;
    name?: string;
  }): Promise<{ code?: string;id?: string;name?: string; }> {
    const url = `${baseURL}/library/book/typeList`
    const resp = await this.gateway.get<LegacyServiceError<{ code?: string;id?: string;name?: string; }>>({ url, payload })
    return resp.data ||resp
  }
}
