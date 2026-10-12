import type { Directive } from 'vue'
import { mainStore } from '@/store'
import { logger } from '@/logger'
/**
 * 权限自定义指令
 * isOpenPermission:是否开启权限
 */
const isOpenPermission = true
export const permission: Directive = {
  mounted (el, binding) {
    const { value } = binding
    if (!isOpenPermission) return
    const store = mainStore()
    const permissionButtton = store.functionsCodes
    if (value) {
      const hasPermission: boolean = permissionButtton.includes(value)
      if (!hasPermission) {
        el.style.display = 'none'
      }
    } else {
      logger.debug('No permission !')
    }
  },
}
