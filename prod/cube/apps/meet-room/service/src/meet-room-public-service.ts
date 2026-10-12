import { type CubeAuth, CubeGateway, LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { BookRoomAppointmentVo } from './types'

const baseURL = `${BASE_API}`

export class CubeMeetRoomPublicService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 获取会议室预约情况（外部调用）
  public async getPublicBookRoomInfo (payload: {
    conferenceId?: number|string;
    date?: string;
    keyword?: string;
    pageNumber: number;
    pageSize: number;
    passTimes?: string[];
    status?: string;
  }, tenant?: string): Promise<BookRoomAppointmentVo> {
    const url = `${baseURL}/conference/public/book-room/appointmentInfo`
    const headers = tenant ? { headers: { tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<BookRoomAppointmentVo>>({
      url,
      query: payload,
      method: 'GET',
      ...headers
    })
    return resp.data || resp
  }
  
}
