import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeCommunicateService } from './communicate-service'
import { getAuthInfoByGLobal } from '@ghcloud/cube-auth-utils'

class ApiProxy extends GatewayProxy {

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    this.getAuthInfo()
    return new CubeDictionaryService(this._authInfo)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    this.getAuthInfo()
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  // 通讯服务
  public get cubeCommunicateService (): CubeCommunicateService {
    this.getAuthInfo()
    return new CubeCommunicateService(this._authInfo)
  }

  public get cubeCommunicateServiceProxy (): CubeCommunicateService {
    return this.createProxiedInstance(this.cubeCommunicateService)
  }

  public override errorNotify (error: ServiceError): void {
    // message.error(error.errorMessage)
  }
  private getAuthInfo (): void {
    const res = getAuthInfoByGLobal()
    if (res){
      this._authInfo.token = res.token
      this._authInfo.tenant = res.tenant
      this._authInfo.terminal = res.terminal
    }
  }
}

export const apiProxy = new ApiProxy()
