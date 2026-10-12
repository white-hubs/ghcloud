export const goStreamPage = (params: Record<string, string>): void => {
  const pathParams = new URLSearchParams(params).toString()
  const streamEnginePath = '/portal/stream-engine-render/index?' + pathParams
  history.pushState({}, '', streamEnginePath)
}
