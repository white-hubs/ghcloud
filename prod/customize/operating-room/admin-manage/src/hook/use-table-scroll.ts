import { type Ref, ref, onMounted, onBeforeMount } from 'vue'

interface UseTableScroll {
  scrollY: Ref<number>;
}

export const useTableScroll = (): UseTableScroll => {
  const scrollY = ref(0)

  const getTableScrollY = (): void => {
    const formDom = document.querySelector('.operating-room-admin-manage-form')
    if (formDom) {
      const formOuterHeight = formDom.clientHeight + (parseFloat(window.getComputedStyle(formDom).marginTop)) + (parseFloat(window.getComputedStyle(formDom).marginBottom))
      const layoutContent = formDom.parentElement?.clientHeight ?? 0
      const tableHeaderHeight = document.querySelector('thead')?.clientHeight ?? 0
      scrollY.value = layoutContent - formOuterHeight - tableHeaderHeight - 1
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
