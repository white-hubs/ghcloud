import { storeCache } from '../store/cache'
import { useCache } from './use-cache'
import { getHashByData } from './use-utils'

interface UseUpdateVersion {
  updateVersion: () => void;
  clearTimer: () => void;
  checkVersion: () => Promise<void>;
  loadBusinessData: () => Promise<void>;
}

export const useUpdateVersion = (): UseUpdateVersion => {
  let timestamp = ''
  const cacheStore = storeCache()
  const { updateCache } = useCache()

  // 检查版本号
  const checkVersion = async (): Promise<void> => {
    try {
      const resp = await fetch('/api/timestamp', { method: 'GET' })
      const result = await resp.text()
      if (timestamp === '') {
        timestamp = result
      }
      if (timestamp !== result && !result.includes('{')) {
        cacheStore.clearTimer()
        window.location.reload()
      }
    } catch (error) {
    }
  }

  // 检查本地哈希值
  const hashKey = 'local-hash'
  let hashTimer: string | number | NodeJS.Timeout | undefined
  const checkLocalHash = async (): Promise<void> => {
    try {
      // 检查data.js是否有变动
      const nowHash = await getHashByData()
      const oldHash = localStorage.getItem(hashKey)
      if (nowHash !== oldHash) {
        localStorage.removeItem(hashKey)
        localStorage.setItem(hashKey, nowHash)
        updateCache()
        window.location.reload()
      }
    } catch {
    }
  }

  // 加载业务数据
  const loadBusinessData = async (): Promise<void> => {
    const firstHash = await getHashByData()
    if (!localStorage.getItem(hashKey)) localStorage.setItem(hashKey, firstHash)
    hashTimer = setInterval(() => {
      checkLocalHash()
    }, 30 * 1000)
  }

  let versionTimer: string | number | NodeJS.Timeout | undefined

  const updateVersion = (): void => {
    loadBusinessData()
    checkVersion()
    versionTimer = setInterval(() => {
      checkVersion()
    }, 30 * 1000)
    updateCache()
  }

  const clearTimer = (): void => {
    versionTimer && clearInterval(versionTimer)
    hashTimer && clearInterval(hashTimer)
    cacheStore.clearTimer()
  }

  return {
    updateVersion,
    clearTimer,
    checkVersion,
    loadBusinessData,
  }
}