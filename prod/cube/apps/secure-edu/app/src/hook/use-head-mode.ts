import { onBeforeMount, ref, type Ref } from 'vue'

interface UseHeadMode {
  /** 是否是总部视角 */
  isHeadMode: Ref<boolean>;
  /** 是否是外链 */
  isOutSideLink: Ref<boolean>;
  basePath: string;
}

export const useHeadMode = (): UseHeadMode => {
  const isHeadMode = ref(false)
  const isOutSideLink = ref(false)
  const isWebChildApp = window.location.pathname.includes('/portal')
  const basePath = window.location.pathname.includes('secure-edu-head') ? '/portal/secure-edu-head' : (isWebChildApp ? '/portal/secure-edu' : '/apps/secure-edu/app')

  onBeforeMount(() => {
    isHeadMode.value = window.location.pathname.includes('secure-edu-head')
    isOutSideLink.value = window.location.pathname.includes('outside-link')
    if (isOutSideLink.value) {
      // 如果当前是PC外链 视角为市场视角
      isHeadMode.value = false
    }
  })

  return {
    isHeadMode, isOutSideLink, basePath
  }
}
