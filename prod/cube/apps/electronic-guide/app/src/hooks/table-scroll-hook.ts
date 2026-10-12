import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export const useScrollHook = (): { scrollY: Ref<number>; } => {
  const scrollY = ref<number>(500)
  const getScrollY = (): void => {
    const ele = document.querySelector('.layout-table')
    const height = ele?.clientHeight
    if (height) {
      scrollY.value = height - 40
    }
  }
  onMounted(() => {
    getScrollY()
    window.addEventListener('resize', getScrollY)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', getScrollY)
  })
  return {
    scrollY
  }
}
