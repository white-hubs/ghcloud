import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QueryCacheRouter, QueryCacheRoute, QueryCacheValue } from '../utils/url-query-cache'
import { readQueryCache, removeQueryCache, writeQueryCache } from '../utils/url-query-cache'

export type CubeQueryState = Record<string, unknown>

export interface CubeQueryStatePageConfig {
  pageNumberField?: string
  pageSizeField?: string
}

export interface CubeQueryStateOptions<T extends CubeQueryState> {
  initialState: T
  cache?: boolean
  cacheFields?: string[]
  storage?: 'session' | 'url'
  storageKey?: string
  page?: CubeQueryStatePageConfig
  resolveValue?: (field: string, raw: string) => unknown
}

export interface CubeQueryStateApi<T extends CubeQueryState> {
  state: T
  cacheFields: string[]
  pageNumberField: string
  pageSizeField: string
  hydrateFromUrl: () => void
  update: (patch: Partial<T>) => void
  setPage: (pageNumber: number, pageSize: number) => void
  resetPage: () => void
  getSnapshot: () => T
  writeCache: (extra?: Record<string, QueryCacheValue>) => void
  clearCache: (extra?: Record<string, QueryCacheValue>) => void
}

const hasWindow = (): boolean => typeof window !== 'undefined' && typeof window.location !== 'undefined'
const getSessionKey = (key: string): string => `cube-query-state:${key}`

const defaultResolveValue = (raw: string): unknown => {
  if (raw === 'true') {
    return true
  }
  if (raw === 'false') {
    return false
  }
  if (raw.includes(',')) {
    return raw.split(',')
  }
  return raw
}

const toCacheObject = (values: Record<string, unknown>, fields: string[]): Record<string, QueryCacheValue> => {
  return fields.reduce<Record<string, QueryCacheValue>>((result, field) => {
    result[field] = values[field] as QueryCacheValue
    return result
  }, {})
}

export const useCubeQueryState = <T extends CubeQueryState>(options: CubeQueryStateOptions<T>): CubeQueryStateApi<T> => {
  const route = useRoute()
  const router = useRouter()
  const cache = options.cache ?? true
  const storage = options.storage ?? 'session'
  const storageKey = options.storageKey
  const state = reactive({ ...options.initialState }) as T
  const pageNumberField = options.page?.pageNumberField ?? 'pageNumber'
  const pageSizeField = options.page?.pageSizeField ?? 'pageSize'
  const cacheFields = options.cacheFields ?? Object.keys(options.initialState)
  const resolveValue = options.resolveValue ?? ((_: string, raw: string) => defaultResolveValue(raw))

  const normalizeRoute = (): QueryCacheRoute | undefined => {
    if (!route) {
      return undefined
    }
    return {
      path: route.path,
      query: route.query as Record<string, unknown>,
      hash: route.hash,
    }
  }

  const normalizeRouter = (): QueryCacheRouter | undefined => {
    if (!router) {
      return undefined
    }
    return {
      replace: router.replace,
    }
  }

  const hydrateFromUrl = (): void => {
    if (!cache || !hasWindow() || storage !== 'url') {
      return
    }
    const params = readQueryCache()
    cacheFields.forEach((field) => {
      const raw = params.get(field)
      if (raw === null || raw === '') {
        return
      }
      state[field as keyof T] = resolveValue(field, raw) as T[keyof T]
    })
  }

  const hydrateFromSession = (): void => {
    if (!cache || !hasWindow() || storage !== 'session' || !storageKey) {
      return
    }
    const raw = sessionStorage.getItem(getSessionKey(storageKey))
    if (!raw) {
      return
    }
    try {
      const payload = JSON.parse(raw) as Record<string, unknown>
      cacheFields.forEach((field) => {
        if (field in payload) {
          state[field as keyof T] = payload[field] as T[keyof T]
        }
      })
    } catch {
      sessionStorage.removeItem(getSessionKey(storageKey))
    }
  }

  const update = (patch: Partial<T>): void => {
    Object.assign(state, patch)
  }

  const resetPage = (): void => {
    const initial = options.initialState
    state[pageNumberField as keyof T] = initial[pageNumberField as keyof T]
    state[pageSizeField as keyof T] = initial[pageSizeField as keyof T]
  }

  const setPage = (pageNumber: number, pageSize: number): void => {
    state[pageNumberField as keyof T] = pageNumber as T[keyof T]
    state[pageSizeField as keyof T] = pageSize as T[keyof T]
    if (cache) {
      writeQueryCache({
        [pageNumberField]: pageNumber,
        [pageSizeField]: pageSize,
      }, normalizeRouter(), normalizeRoute())
    }
  }

  const getSnapshot = (): T => {
    return { ...state }
  }

  const writeCache = (extra: Record<string, QueryCacheValue> = {}): void => {
    if (!cache) {
      return
    }
    if (storage === 'url') {
      writeQueryCache({
        ...toCacheObject(state, cacheFields),
        ...extra,
      }, normalizeRouter(), normalizeRoute())
      return
    }
    if (storage === 'session' && storageKey) {
      const next = {
        ...toCacheObject(state, cacheFields),
        ...extra,
      }
      sessionStorage.setItem(getSessionKey(storageKey), JSON.stringify(next))
    }
  }

  const clearCache = (extra: Record<string, QueryCacheValue> = {}): void => {
    if (!cache) {
      return
    }
    if (storage === 'url') {
      removeQueryCache(cacheFields, extra, normalizeRouter(), normalizeRoute())
      return
    }
    if (storage === 'session' && storageKey) {
      sessionStorage.removeItem(getSessionKey(storageKey))
    }
  }

  hydrateFromSession()
  hydrateFromUrl()

  return {
    state,
    cacheFields,
    pageNumberField,
    pageSizeField,
    hydrateFromUrl,
    update,
    setPage,
    resetPage,
    getSnapshot,
    writeCache,
    clearCache,
  }
}
