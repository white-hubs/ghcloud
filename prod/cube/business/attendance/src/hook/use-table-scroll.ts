import { type Ref, ref, onMounted, onBeforeMount } from 'vue'

interface UseTableScroll {
  scorllY: Ref<number>;
}

export const useTableScroll = (): UseTableScroll => {
  const scorllY = ref(0)

  const getTableScrollY = (): void => {
    const formDom = document.querySelector('.attendance-form')
    if (formDom) {
      const formOuterHeight = formDom.clientHeight + (parseFloat(window.getComputedStyle(formDom).marginTop)) + (parseFloat(window.getComputedStyle(formDom).marginBottom))
      const layoutContent = formDom.parentElement?.clientHeight ?? 0
      const tableHeaderHeight = document.querySelector('thead')?.clientHeight ?? 0
      scorllY.value = layoutContent - formOuterHeight - tableHeaderHeight - 1
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
    scorllY
  }
}
