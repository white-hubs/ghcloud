import { mainStore } from '@/store'

/** 是否有权限 */
export const hasPermission = (code: string): boolean => {
  const store = mainStore()
  const permissionButton = store.functionsCodes
  const res: boolean = permissionButton.includes(code)
  return res
}
