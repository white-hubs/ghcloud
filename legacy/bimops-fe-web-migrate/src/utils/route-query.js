/**
 * 读取 vue-router LocationQuery 中的单个参数是否为「真」形态（与粮仓 isFullWindow 约定一致）。
 * @param {import('vue-router').LocationQuery} query
 * @param {string} key
 * @returns {boolean}
 */
export function _query (query, key) {
  const raw = query[key]
  if (raw == null) {
    return false
  }
  if (Array.isArray(raw)) {
    return raw.some((v) => v === '1' || v === 'true')
  }
  return raw === '1' || raw === 'true'
}
