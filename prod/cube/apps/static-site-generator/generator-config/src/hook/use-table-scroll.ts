import { type Ref, ref, onMounted, onBeforeMount } from 'vue'

interface UseTableScroll {
  scrollY: Ref<number>;
}

export const useTableScroll = (): UseTableScroll => {
  const scrollY = ref(0)

  const getTableScrollY = (): void => {
    const layoutContent = document.getElementById('cube-layout-content')
    const searchContent = document.getElementById('cube-query-form-container')
    if (!layoutContent) {
      scrollY.value = 0
      return
    }
    if (!searchContent) {
      scrollY.value = 0
      return
    }
    scrollY.value = layoutContent.clientHeight - searchContent.clientHeight - 40
  }

  onMounted(() => {
    getTableScrollY()
    window.addEventListener('resize', getTableScrollY)
  })

  onBeforeMount(() => {
    window.removeEventListener('resize', getTableScrollY)
  })

  return {
    scrollY
  }
}
