import { type Ref, ref, onMounted, onBeforeMount } from 'vue'

interface UseTableScroll {
  scrollY: Ref<number>;
}

export const useTableScroll = (): UseTableScroll => {
  const scrollY = ref(0)

  const getTableScrollY = (): void => {
    const formDom = document.querySelector('.bi-data-management-form')
    const content = document.querySelector('.layout-content')
    if (formDom) {
      const formOuterHeight = formDom.clientHeight
      const layoutContent = content?.clientHeight ?? 0
      scrollY.value = layoutContent - formOuterHeight
    }
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
