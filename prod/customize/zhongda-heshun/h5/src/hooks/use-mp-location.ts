import { onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'

/** 绑定设备时复用：与路由无关，避免 web-view 重载后丢失 */
const BIND_LOCATION_SESSION_KEY = 'zhongda_heshun_bind_location'
/** 10 分钟 */
const BIND_LOCATION_TTL_MS = 600_000

export interface BindLocationSession {
  latitude: number
  longitude: number
  ts: number
}

function getValidBindLocationFromSession (): { latitude: number; longitude: number } | null {
  try {
    const raw = sessionStorage.getItem(BIND_LOCATION_SESSION_KEY)
    if (!raw) {
      return null
    }
    const { latitude, longitude, ts } = JSON.parse(raw) as BindLocationSession
    if (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !Number.isNaN(latitude) &&
      !Number.isNaN(longitude) &&
      Date.now() - ts < BIND_LOCATION_TTL_MS
    ) {
      return { latitude, longitude }
    }
  } catch {
    // ignore
  }
  return null
}

function consumeLocationFromCurrentUrl (): { latitude: number; longitude: number } | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const href = window.location.href
    const hashQuery = href.includes('?') ? href.slice(href.indexOf('?') + 1) : ''
    if (!hashQuery) {
      return null
    }
    const params = new URLSearchParams(hashQuery)
    const raw = params.get('mpLocationResult')
    if (!raw) {
      return null
    }
    const parsed = parseMpLocationQuery(raw)
    if (!parsed?.success) {
      return null
    }
    persistBindLocationFromPayload(parsed)
    const valid = getValidBindLocationFromSession()
    if (!valid) {
      return null
    }
    // 清理 URL，避免重复消费
    params.delete('mpLocationResult')
    const nextQuery = params.toString()
    const [base] = href.split('?')
    window.history.replaceState(null, '', `${base}${nextQuery ? `?${nextQuery}` : ''}`)
    return valid
  } catch {
    return null
  }
}

export function persistBindLocationFromPayload (p: MpLocationPayload | null): void {
  if (!p?.success || p.latitude === undefined || p.longitude === undefined) {
    return
  }
  if (Number.isNaN(p.latitude) || Number.isNaN(p.longitude)) {
    return
  }
  try {
    sessionStorage.setItem(
      BIND_LOCATION_SESSION_KEY,
      JSON.stringify({
        latitude: p.latitude,
        longitude: p.longitude,
        ts: Date.now(),
      } satisfies BindLocationSession),
    )
  } catch {
    // ignore
  }
}

/**
 * 设备绑定（手动/扫码）前取当前经纬度：优先会话缓存；非小程序内再尝试浏览器定位。
 */
export async function getCoordsForBind (): Promise<{ latitude?: number; longitude?: number }> {
  const fromSession = getValidBindLocationFromSession()
  if (fromSession) {
    return fromSession
  }
  const fromUrl = consumeLocationFromCurrentUrl()
  if (fromUrl) {
    return fromUrl
  }

  const isWx = await cubeWxService.getWxEnv()
  if (isWx) {
    return {}
  }

  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({})
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          sessionStorage.setItem(
            BIND_LOCATION_SESSION_KEY,
            JSON.stringify({ latitude, longitude, ts: Date.now() } satisfies BindLocationSession),
          )
        } catch {
          // ignore
        }
        resolve({ latitude, longitude })
      },
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    )
  })
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForCoordsFromMpResult (timeoutMs = 12_000): Promise<{ latitude: number; longitude: number } | null> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const fromSession = getValidBindLocationFromSession()
    if (fromSession) {
      return fromSession
    }
    const fromUrl = consumeLocationFromCurrentUrl()
    if (fromUrl) {
      return fromUrl
    }
    await sleep(300)
  }
  return null
}

/**
 * 设备绑定前强制校验经纬度：
 * - 小程序环境：拉起定位授权/定位，拿到有效经纬度前不允许继续绑定
 * - 非小程序：尝试浏览器定位，拿不到则抛错阻断绑定
 */
export async function ensureCoordsForBind (options?: {
  maxAttempts?: number;
  perAttemptTimeoutMs?: number;
}): Promise<{ latitude: number; longitude: number }> {
  const first = await getCoordsForBind()
  if (typeof first.latitude === 'number' && typeof first.longitude === 'number') {
    return { latitude: first.latitude, longitude: first.longitude }
  }

  const isWx = await cubeWxService.getWxEnv()
  if (!isWx) {
    throw new Error('未获取到定位信息，请先开启定位权限后重试')
  }

  const maxAttempts = options?.maxAttempts ?? 6
  const perAttemptTimeoutMs = options?.perAttemptTimeoutMs ?? 12_000

  let attempt = 0
  while (attempt < maxAttempts) {
    attempt += 1
    cubeWxService.requestMiniProgramLocation()
    const coords = await waitForCoordsFromMpResult(perAttemptTimeoutMs)
    if (coords) {
      return coords
    }
  }

  throw new Error('定位授权未完成，请允许小程序定位权限后再试')
}

/** 小程序 wx.getLocation / uni.getLocation 回传结构（与桥页 locationResult 一致） */
export interface MpLocationPayload {
  action?: string
  success: boolean
  latitude?: number
  longitude?: number
  speed?: number
  accuracy?: number
  altitude?: number
  verticalAccuracy?: number
  horizontalAccuracy?: number
  error?: unknown
}

export interface UseMpLocation {
  isWxEnv: Ref<boolean>
  /** 最近一次解析到的定位（含失败信息） */
  mpLocation: Ref<MpLocationPayload | null>
  /** 仅在微信小程序 web-view 内有效：跳转桥页拉起原生定位 */
  requestMiniProgramLocation: () => void
  /** 非小程序环境：浏览器 Geolocation */
  requestBrowserLocation: () => void
}

function parseMpLocationQuery (raw: unknown): MpLocationPayload | null {
  if (raw === undefined || raw === null || raw === '') {
    return null
  }
  const str = typeof raw === 'string' ? raw : String(raw)
  try {
    return JSON.parse(decodeURIComponent(str)) as MpLocationPayload
  } catch {
    try {
      return JSON.parse(str) as MpLocationPayload
    } catch {
      return null
    }
  }
}

/**
 * 设备 H5：与小程序桥页配合，读取 mpLocationResult；并提供主动请求定位能力。
 */
export const useMpLocation = (): UseMpLocation => {
  const isWxEnv = ref(false)
  const mpLocation = ref<MpLocationPayload | null>(null)
  const route = useRoute()
  const router = useRouter()

  const consumeLocationFromQuery = (): void => {
    const raw = route.query.mpLocationResult
    if (raw === undefined || raw === null || (Array.isArray(raw) && raw.length === 0)) {
      return
    }
    const val = Array.isArray(raw) ? raw[0] : raw
    const parsed = parseMpLocationQuery(val)
    if (parsed) {
      mpLocation.value = parsed
      persistBindLocationFromPayload(parsed)
    }
    const nextQuery = { ...route.query }
    delete nextQuery.mpLocationResult
    router.replace({ path: route.path, query: nextQuery }).catch(function(){})
  }

  const requestMiniProgramLocation = (): void => {
    cubeWxService.requestMiniProgramLocation()
  }

  const requestBrowserLocation = (): void => {
    if (!navigator.geolocation) {
      mpLocation.value = { success: false, error: new Error('浏览器不支持定位') }
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const payload: MpLocationPayload = {
          success: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        mpLocation.value = payload
        persistBindLocationFromPayload(payload)
      },
      (err) => {
        mpLocation.value = { success: false, error: err }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  onMounted(async () => {
    isWxEnv.value = await cubeWxService.getWxEnv()
    consumeLocationFromQuery()
  })

  watch(
    () => route.query.mpLocationResult,
    () => {
      if (route.query.mpLocationResult !== undefined && route.query.mpLocationResult !== null) {
        consumeLocationFromQuery()
      }
    },
  )

  return {
    isWxEnv,
    mpLocation,
    requestMiniProgramLocation,
    requestBrowserLocation,
  }
}
