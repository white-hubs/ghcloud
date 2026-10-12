import { type Ref, ref, onMounted, onBeforeMount } from 'vue'

interface UseTableInfoScroll {
  scrollY: Ref;
  tabScrollY: Ref;
}

export const useTableInfoScroll = (): UseTableInfoScroll => {
  const scrollY = ref(0)
  const tabScrollY = ref(0)

  const getTableScrollY = (): void => {
    const layoutDom = document.querySelector('.device-center-layout-content')
    const topInfoDom = document.querySelector('.top-info') || document.querySelector('#top-info')
    if (topInfoDom && layoutDom) {
      const formOuterHeight = topInfoDom.clientHeight + (parseFloat(window.getComputedStyle(topInfoDom).marginTop)) + (parseFloat(window.getComputedStyle(topInfoDom).marginBottom))
      const layoutContent = layoutDom.clientHeight ?? 0
      const tableHeaderHeight = document.querySelector('thead')?.clientHeight ?? 0
      const tabsNavDom = document.querySelector('.device-center-tabs-nav')
      const tabsTopDom = document.querySelector('#top-header')
      const paginationDom = document.querySelector('.device-center-table-pagination ')
      const tabsNavHeight = tabsNavDom ? tabsNavDom.clientHeight + (parseFloat(window.getComputedStyle(tabsNavDom).marginTop)) + (parseFloat(window.getComputedStyle(tabsNavDom).marginBottom)) : 0
      const tabsTopHeight = tabsTopDom ? tabsTopDom.clientHeight + (parseFloat(window.getComputedStyle(tabsTopDom).marginTop)) + (parseFloat(window.getComputedStyle(tabsTopDom).marginBottom)) : 0
      const paginationHeight = paginationDom ? paginationDom.clientHeight + (parseFloat(window.getComputedStyle(paginationDom).marginTop)) + (parseFloat(window.getComputedStyle(paginationDom).marginBottom)) : 60
      scrollY.value = layoutContent - formOuterHeight - tableHeaderHeight - tabsNavHeight - tabsTopHeight - paginationHeight - 1
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
    scrollY,
    tabScrollY
  }
}
