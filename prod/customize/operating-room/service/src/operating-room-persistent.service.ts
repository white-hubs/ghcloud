import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import Crypto from './utils/crypot'

/** 获取持久化配置 */
export class CubeOperatingRoomPersistentService {
  private readonly gateway: CubeGateway
  private readonly securityManagementService: CubeSecurityManagementService
  private readonly iotService: CubeDeviceCenterService
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
    this.securityManagementService = new CubeSecurityManagementService(auth)
    this.iotService = new CubeDeviceCenterService(auth)
  }

  private readonly uniqueKey: string = 'operating-room-correct-config'
  private readonly auth = {
    iotAccount: '260',
    iotPassword: '123456',
    iotUrl: 'http://192.168.2.118:9898',

    token: '87c2574fd78748a89ab4a0ef01f3ef50',
    tenant: '58197260'
  }

  /** 修正记录 获取持久化配置 */
  public async getPersistent (payload: {
    iotUrl?: string | null | undefined;
    iotAccount?: string | null | undefined;
    iotPassword?: string | null | undefined;
  }): Promise<{ config: string; uniqueKey: string; }> {
    return new Promise((resolve, reject) => {
      const url = `${payload.iotUrl ?? this.auth.iotUrl}/api/login`
      this.gateway.custom<LegacyServiceError<{
        token: string;
        tenant: string;
      }>>({
        url,
        payload: {
          userName: payload.iotAccount ?? this.auth.iotAccount,
          password: Crypto.encrypt(payload.iotPassword ?? this.auth.iotPassword)
        },
        method: 'POST'
      }).then(async (LoginResp) => {
        const persistentResp = await this.gateway.custom<LegacyServiceError<{ config: string; uniqueKey: string; }>>({
          url: `${payload.iotUrl ?? this.auth.iotUrl}/api/persistent/findPersistentByKey`,
          payload: {
            uniqueKey: this.uniqueKey,
          },
          headers: {
            Tenant: LoginResp.data.tenant ?? this.auth.tenant,
            Token: LoginResp.data.token ?? this.auth.token
          },
          method: 'GET'
        })
        resolve(persistentResp.data)
      }).catch(() => {
        reject({ errorMessage: '获取持久化配置失败' })
      })
    })
  }

  /** 修正记录 保存持久化配置 */
  public async updatePersistent (payload: {
    config?: string | null | undefined;
    iotUrl?: string | null | undefined;
    iotAccount?: string | null | undefined;
    iotPassword?: string | null | undefined;
  }): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const url = `${payload.iotUrl ?? this.auth.iotUrl}/api/login`
      this.gateway.custom<LegacyServiceError<{
        token: string;
        tenant: string;
      }>>({
        url,
        payload: {
          userName: payload.iotAccount ?? this.auth.iotAccount,
          password: Crypto.encrypt(payload.iotPassword ?? this.auth.iotPassword)
        },
        method: 'POST'
      }).then(async (LoginResp) => {
        const persistentResp = await this.gateway.custom<LegacyServiceError<unknown>>({
          url: `${payload.iotUrl ?? this.auth.iotUrl}/api/persistent/updateOrSavePst`,
          payload: {
            uniqueKey: this.uniqueKey,
            config: payload.config
          },
          headers: {
            Tenant: LoginResp.data.tenant ?? this.auth.tenant,
            Token: LoginResp.data.token ?? this.auth.token
          },
          method: 'POST'
        })
        resolve(persistentResp.data)
      }).catch(() => {
        reject({ errorMessage: '更新持久化配置失败' })
      })
    })
  }
}
