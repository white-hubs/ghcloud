import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { getAuthInfoByGLobal } from '@ghcloud/cube-auth-utils'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'

class ApiProxy extends GatewayProxy {
  public get cubeMDataServiceProxy (): CubeMdataService {
    this.getAuthInfo()
    return this.createProxiedInstance(new CubeMdataService(this._authInfo))
  }
  public get cubeOuaaServiceProxy (): CubeOuaaService {
    this.getAuthInfo()
    return this.createProxiedInstance(new CubeOuaaService(this._authInfo))
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

