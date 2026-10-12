import { type Ref, ref, onMounted, onBeforeMount } from 'vue'

interface UseTableScroll {
  scrollY: Ref;
  tabScrollY: Ref;
}

export const useTableScroll = (): UseTableScroll => {
  const scrollY = ref(0)
  const tabScrollY = ref(0)

  const getTableScrollY = (): void => {
    const formDom = document.querySelector('.device-center-form')
    if (formDom) {
      const formOuterHeight = formDom.clientHeight + (parseFloat(window.getComputedStyle(formDom).marginTop)) + (parseFloat(window.getComputedStyle(formDom).marginBottom))
      const layoutContent = formDom.parentElement?.clientHeight ?? 0
      const tableHeaderHeight = document.querySelector('thead')?.clientHeight ?? 0
      scrollY.value = layoutContent - formOuterHeight - tableHeaderHeight - 1
    }
  }

  const getScrollY = (): void => {
    const tabsDom = document.querySelector('.device-center-tabs')
    const layoutContent = tabsDom ? tabsDom.parentElement?.clientHeight ?? 0 : 0
    // logger.debug(layoutContent, 'tabslayoutContent')
    tabScrollY.value = layoutContent
  }

  onMounted(() => {
    getTableScrollY()
    window.addEventListener('resize', getTableScrollY)
    getScrollY()
    window.addEventListener('resize', getScrollY)
  })

  onBeforeMount(() => {
    window.removeEventListener('resize', getTableScrollY)
    window.removeEventListener('resize', getScrollY)
  })

  return {
    scrollY,
    tabScrollY
  }
}
