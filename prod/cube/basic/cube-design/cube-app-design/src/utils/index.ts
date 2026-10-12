enum CubeTerminalEnum {
  BUSINESS = 'bimops-manage-web', // 业务管理
  VISUALIZATION = 'three-dimensional-visualization', // 三维可视化
}
interface AuthStoreVo {
  tenant: string;
  token: string;
  terminal: CubeTerminalEnum;
}
export const bindMethods = <T extends object> (instance: T): void => {
  const prototype = Object.getPrototypeOf(instance)
  const propertyNames = Object.getOwnPropertyNames(prototype)

  propertyNames.forEach((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
    const propertyValue = instance[propertyName as keyof T]

    if (
      typeof propertyValue === 'function' &&
        propertyName !== 'constructor' &&
        descriptor &&
        !descriptor.get &&
        !descriptor.set
    ) {
      instance[propertyName as keyof T] = propertyValue.bind(instance)
    }
  })
}
export function debounce<T extends (...args: unknown[]) => unknown> (
  func: T,
  wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    clearTimeout(timeout!)
    timeout = setTimeout(() => {

      // @ts-expect-error
      func.apply(this, args)
    }, wait)
  }
}
type ThrottleFunction<T extends (...args: unknown[]) => unknown> = (...args: unknown[]) => ReturnType<T>

export function promiseThrottle<F extends ThrottleFunction<F>> (fn: F, limit: number): F {
  let inThrottle: boolean = false

  return function (...args: Parameters<F>): ReturnType<F> {
    if (!inThrottle) {
      inThrottle = true

      // 执行异步函数并等待其完成
      const result = fn(...args)

      // 在 limit 时间后或异步操作完成后重置标志
      const resetThrottle = (): void => {
        inThrottle = false
      }

      // 确保在异步操作完成后再重置标志

      // @ts-expect-error

      result.finally(resetThrottle)

      // 同时设置一个定时器，确保即使异步操作未完成，也能在 limit 时间后重置
      setTimeout(resetThrottle, limit)
      return result
    } else {
      // 如果当前处于节流状态，返回一个未完成的 Promise
      return new Promise(() => { }) as ReturnType<F>
    }
  } as unknown as F
}
export const getAppAuthStore = (): {
  applicationCode: string;
  authStore: AuthStoreVo;
} => {
  const token = sessionStorage.getItem('GH-Token') ?? JSON.stringify({ access_token: '' })
  const currentEnterprise = sessionStorage.getItem('GH-NowEnterprise') ?? JSON.stringify({ code: '' })
  const currentAppStorage = sessionStorage.getItem('GH-currentApplication') ?? JSON.stringify({ code: '' })

  const tokenInfo = JSON.parse(token) as { access_token: string; }
  const enterpriseInfo = JSON.parse(currentEnterprise) as { code: string; }
  const currentApp = JSON.parse(currentAppStorage) as { code: string; }
  return {
    applicationCode: currentApp.code,
    authStore: {
      token: tokenInfo.access_token,
      tenant: enterpriseInfo.code,
      terminal: CubeTerminalEnum.BUSINESS
    }
  }
}

// 过滤空值属性（空字符串、undefined、null）
type ParamsType = Record<string, unknown>
export function filterEmptyValues<T extends ParamsType> (params: T): Partial<T> {
  if (typeof params !== 'object' || params === null) {
    throw new Error('Invalid input type. Expected an object.')
  }
  return Object.entries(params).reduce<Partial<T>>((acc, [key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      // @ts-expect-error: The key is guaranteed to be a keyof T due to the reduce initializer.
      acc[key as keyof T] = value
    }
    return acc
  }, {})
}
