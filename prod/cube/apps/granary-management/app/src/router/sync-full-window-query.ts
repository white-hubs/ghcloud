import type { LocationQuery, Router } from 'vue-router'

const FULL_WINDOW_QUERY_KEY = 'isFullWindow' as const
const FULL_WINDOW_QUERY_VALUE = '1' as const

function queryImpliesFullWindow (query: LocationQuery): boolean {
  const raw = query[FULL_WINDOW_QUERY_KEY]
  if (raw == null) {
    return false
  }
  if (Array.isArray(raw)) {
    return raw.some((v) => v === FULL_WINDOW_QUERY_VALUE || v === 'true')
  }
  return raw === FULL_WINDOW_QUERY_VALUE || raw === 'true'
}

/**
 * 宿主 qiankun 读不到子应用 route.meta，通过地址栏 query 与 meta.isFullWindow 对齐。
 */
export function registerSyncFullWindowQuery (router: Router): void {
  router.beforeEach((to, _from, next) => {
    const wantsFull = to.meta.isFullWindow === true
    const hasFlag = queryImpliesFullWindow(to.query)

    if (wantsFull && !hasFlag) {
      next({
        ...to,
        query: { ...to.query, [FULL_WINDOW_QUERY_KEY]: FULL_WINDOW_QUERY_VALUE },
        replace: true,
      })
      return
    }

    if (!wantsFull && to.query[FULL_WINDOW_QUERY_KEY] != null) {
      const nextQuery = { ...to.query }
      delete nextQuery[FULL_WINDOW_QUERY_KEY]
      next({ ...to, query: nextQuery, replace: true })
      return
    }

    next()
  })
}
