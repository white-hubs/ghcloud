import { CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API, CubeHeaders, CubeTerminalEnum } from '@ghcloud/cube-protocol'

const publicGateway = new CubeGateway()

export interface GenerateCodeResponse {
  code: string
  key: string
}

export const generateCode = async (): Promise<GenerateCodeResponse> => {
  const url = `${BASE_API}/ouaa/public/auth/login/code/generate`
  const resp = await publicGateway.get<GenerateCodeResponse>({
    url
  })
  return resp
}

export interface LoginOfSimpleCodeParams {
  key: string
  code: string
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export const loginOfSimpleCode = async (params: LoginOfSimpleCodeParams): Promise<LoginResponse> => {
  const url = `/gw-bff/auth/token`
  const form = new FormData()
  form.append('grant_type', 'pwd_simple_code')
  form.append('key', params.key)
  form.append('code', params.code)
  form.append('username', params.username)
  form.append('password', params.password)
  const resp = await publicGateway.custom<LoginResponse>({
    url,
    payload: form,
    method: 'POST',
    headers: {
      [CubeHeaders.TERMINAL]: CubeTerminalEnum.ADMIN
    }
  })
  return resp
}
