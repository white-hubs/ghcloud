import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { message } from '@ghcloud/cube-ui'
import { CubeGraphEditorService } from '@ghcloud/cube-graph-editor-service'
import { authStore } from './auth-store'

class ApiProxy extends GatewayProxy {
  public get cubeGraphEditorService(): CubeGraphEditorService {
    return new CubeGraphEditorService(authStore)
  }

  public get cubeGraphEditorServiceProxy(): CubeGraphEditorService {
    return this.createProxiedInstance(this.cubeGraphEditorService)
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()

export const cubeGraphEditorService = apiProxy.cubeGraphEditorServiceProxy

