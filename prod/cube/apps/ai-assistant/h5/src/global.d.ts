declare module '*.module.less' {
  const classes: Record<string, string>
  export default classes
}

interface EnvDefine {
  baseApiUrl: string
  authHeaders?: Record<string, string>
  appUser?: Record<string, unknown>
  applicationCode: string
}

declare const __ENV__: EnvDefine
