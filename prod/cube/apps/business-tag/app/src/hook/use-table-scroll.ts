import { type Ref, ref, onMounted, onBeforeUnmount } from 'vue'

interface UseTableScroll {
  scrollY: Ref<number>;
}

export const useTableScroll = (): UseTableScroll => {
  const scrollY = ref(0)

  const getTableScrollY = (): void => {
    const contentEl = document.getElementById('tag-association-container')
    if (!contentEl) {
      scrollY.value = 300
      return
    }
    scrollY.value = contentEl.clientHeight - 56 - 72 - 72 - 50
  }

  onMounted(() => {
    getTableScrollY()
    window.addEventListener('resize', getTableScrollY)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', getTableScrollY)
  })

  return {
    scrollY
  }
}
