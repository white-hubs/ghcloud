/**
 * 获取 url 查询参数（重复参数会被覆盖）
 * @returns query params map
 */
export function getQueryParameters (): Record<string, string> {
  const search = location.search.replace(/^\?+/, '')
  const entries = search.split('&').map((kv) => {
    const [k, v] = kv.split('=')
    return [k, v]
  })
  const result: Record<string, string> = {}
  entries.forEach(([k, v]) => {
    result[k] = v
  })
  return result
}

