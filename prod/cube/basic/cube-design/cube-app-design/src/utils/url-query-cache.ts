export type QueryCacheValue = string | number | boolean | null | undefined | Array<string | number | boolean | null | undefined>

export interface QueryCacheRoute {
  path: string;
  query: Record<string, unknown>;
  hash?: string;
}

export interface QueryCacheRouter {
  replace: (location: { path: string; query: Record<string, string | string[]>; hash?: string }) => Promise<unknown>;
}

const hasWindow = (): boolean => typeof window !== 'undefined' && typeof window.location !== 'undefined'

const serializeValue = (value: QueryCacheValue): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  if (Array.isArray(value)) {
    const serialized = value.filter((item) => item !== undefined && item !== null && item !== '').join(',')
    return serialized === '' ? undefined : serialized
  }
  return String(value)
}

const normalizeQuery = (query: Record<string, unknown>): Record<string, string | string[]> => {
  return Object.entries(query).reduce<Record<string, string | string[]>>((result, [key, value]) => {
    if (Array.isArray(value)) {
      const items = value.filter((item): item is string => typeof item === 'string')
      if (items.length > 0) {
        result[key] = items
      }
    } else if (value !== undefined && value !== null) {
      result[key] = String(value)
    }
    return result
  }, {})
}

const replaceQuery = (values: Record<string, QueryCacheValue>, router?: QueryCacheRouter, route?: QueryCacheRoute): void => {
  if (router && route) {
    const query = normalizeQuery(route.query)
    Object.entries(values).forEach(([key, value]) => {
      const serialized = serializeValue(value)
      if (serialized === undefined) {
        delete query[key]
      } else {
        query[key] = serialized
      }
    })
    void router.replace({ path: route.path, query, hash: route.hash }).catch(() => undefined)
    return
  }

  if (!hasWindow()) {
    return
  }
  const url = new URL(window.location.href)
  Object.entries(values).forEach(([key, value]) => {
    const serialized = serializeValue(value)
    if (serialized === undefined) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, serialized)
    }
  })
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

export const readQueryCache = (): URLSearchParams => {
  if (!hasWindow()) {
    return new URLSearchParams()
  }
  return new URLSearchParams(window.location.search)
}

export const getQueryCacheValue = (key: string, route?: QueryCacheRoute): string | undefined => {
  const routeValue = route?.query[key]
  const value = routeValue !== undefined && routeValue !== null
    ? Array.isArray(routeValue) ? routeValue[0] : routeValue
    : readQueryCache().get(key)
  return value === null || value === undefined || value === '' ? undefined : String(value)
}

export const writeQueryCache = (values: Record<string, QueryCacheValue>, router?: QueryCacheRouter, route?: QueryCacheRoute): void => {
  replaceQuery(values, router, route)
}

export const removeQueryCache = (keys: string[], values: Record<string, QueryCacheValue> = {}, router?: QueryCacheRouter, route?: QueryCacheRoute): void => {
  const nextValues = keys.reduce<Record<string, QueryCacheValue>>((result, key) => {
    result[key] = undefined
    return result
  }, { ...values })
  replaceQuery(nextValues, router, route)
}
