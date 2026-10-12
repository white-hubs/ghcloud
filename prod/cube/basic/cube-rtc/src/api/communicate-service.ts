import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { TencentAuth } from './types'

const PREFIX = `${BASE_API}/fusion-communicate`;

export class CubeCommunicateService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 获取用户腾讯鉴权信息
   * @returns Promise<TencentAuth> 返回腾讯鉴权信息
   */
  public async getTencentAuth (): Promise<TencentAuth> {
    const url = `${PREFIX}/tencent/communication/sig`
    const resp = await this.gateway.get<TencentAuth>({ url })
    return resp
  }

  /**
   * 创建会议房间
   * @returns Promise<string> 返回会议房间号
   */
  public async createConferenceRoom (): Promise<string> {
    const url = `${PREFIX}/conference-room/create`
    const resp = await this.gateway.create<{ roomNumber: string; }>({ url })
    return resp.roomNumber
  }

  /**
   * 会议房间发起
   * @param payload { roomNumber: string; mediaType: string; callingType: string; proposeUserId: string; conferenceUsers: string[]; }
   * @returns Promise<unknown> 返回会议房间发起的响应数据
   */
  public async proposeConferenceRoom (
    payload: {
      roomNumber: string;
      mediaType: string;
      callingType: string;
      proposeUserId: string;
      conferenceUsers: string[];
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/propose`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 加入会议房间
   * @param payload { roomNumber: string; }
   * @returns Promise<unknown> 返回加入会议房间的响应数据
   */
  public async joinConferenceRoom (
    payload: {
      roomNumber: string;
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/join`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 离开会议房间
   * @param payload { roomNumber: string; }
   * @returns Promise<unknown> 返回离开会议房间的响应数据
   */
  public async leaveConferenceRoom (
    payload: {
      roomNumber: string;
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/leave`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 拒绝加入会议
   * @param payload { roomNumber: string; }
   * @returns Promise<unknown> 返回拒绝加入会议的响应数据
   */
  public async refuseJoinConferenceRoom (
    payload: {
      roomNumber: string;
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/refuse-join`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 踢出会议房间用户
   * @param payload { roomNumber: string; userIds: string[]; }
   * @returns Promise<unknown> 返回踢出会议房间用户的响应数据
   */
  public async removeUserOfConferenceRoom (
    payload: {
      roomNumber: string;
      userIds: string[];
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/remove/user`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 会议房间邀请用户
   * @param payload { roomNumber: string; mediaType: string; callingType: string; proposeUserId: string; conferenceUsers: string[]; }
   * @returns Promise<unknown> 返回邀请用户的响应数据
   */
  public async inviteUserOfConferenceRoom (
    payload: {
      roomNumber: string;
      mediaType: string;
      callingType: string;
      proposeUserId: string;
      conferenceUsers: string[];
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/invite`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 关闭房间
   * @param payload { roomNumber: string }
   * @returns Promise<unknown> 返回关闭房间的响应数据
   */
  public async closeConferenceRoom (
    payload: {
      roomNumber: string;
    }
  ): Promise<unknown> {
    const url = `${PREFIX}/conference-room/close`
    const resp = await this.gateway.create({ url, payload })
    return resp
  }

  /**
   * 登录通讯
   * @returns Promise<unknown> 返回登录通讯的响应数据
   */
  public async login (): Promise<unknown> {
    const url = `${PREFIX}/fusion-communicate/assign/current-user`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url })
    return resp.data || resp
  }

  /**
   * 退出通讯
   * @returns Promise<unknown> 返回退出通讯的响应数据
   */
  public async logout (): Promise<unknown> {
    const url = `${PREFIX}/fusion-communicate/disable/current-user`
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url })
    return resp.data || resp
  }

  /**
   * 发送心跳请求保持连接活跃
   * @returns Promise<unknown> 返回心跳请求的响应数据
   */
  public async keepAlive (): Promise<unknown> {
    const url = `${PREFIX}/fusion-communicate/current-user/keep-alive`
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url })
    return resp.data || resp
  }

  /**
   * 查询在线列表
   * @returns Promise<{ id: string;name: string; }[]> 返回在线列表
   */
  public async queryOnlineList (): Promise<{ id: string;name: string; }[]> {
    const url = `${PREFIX}/fusion-communicate/sys-users`
    const resp = await this.gateway.create<LegacyServiceError<{ id: string;name: string; }[]>>({ url, payload: [] })
    return resp.data || resp
  }

  /**
   * 获取历史轨迹
   */
  public async getHistoryTrack (payload: {
    userId: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<{ pages: number;total: number;records: {
      address: string;
      direction: unknown;
      height: unknown;
      id: string;
      lat: number;
      lng: number;
      speed: number | null;
      uploadTime: number;
      userId: string;
    }[]; }> {
    const url = `${PREFIX}/gps/page`
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number;total: number;records: {
      address: string;
      direction: unknown;
      height: unknown;
      id: string;
      lat: number;
      lng: number;
      speed: number | null;
      uploadTime: number;
      userId: string;
    }[]; }>>({ url, payload })
    return resp.data || resp
  }
}