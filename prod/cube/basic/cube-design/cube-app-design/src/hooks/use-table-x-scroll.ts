import { onMounted, onBeforeUnmount, ref, type Ref, inject, watch } from 'vue'
import { TABLE_SCROLL_REF_KEY } from '../base-components/cube-layout/cube-layout'

interface UseTableXScroll {
  initTableXScroll: () => void;
  updateTableXScroll: () => void;
  isEnabled: Ref<boolean>;
}

interface LayoutScrollInfo {
  tableScrollRef: Ref<HTMLElement | null>;
  showTableXScroll: boolean;
  updateCaptureAreaHeight?: () => void;
}

export const useTableXScroll = (): UseTableXScroll => {
  const tableBodyRef = ref<HTMLElement | null>(null)
  const tableScrollRef = ref<HTMLElement | null>(null)
  const tableScrollContentRef = ref<HTMLElement | null>(null)
  const isEnabled = ref(false)

  const layoutScrollInfo = inject<LayoutScrollInfo | null>(TABLE_SCROLL_REF_KEY, null)

  const updateTableXScroll = (): void => {
    if (!tableBodyRef.value || !tableScrollContentRef.value) return
    const tableWidth = tableBodyRef.value.scrollWidth
    tableScrollContentRef.value.style.width = `${tableWidth}px`

    // 更新捕获区域高度
    if (layoutScrollInfo?.updateCaptureAreaHeight) {
      layoutScrollInfo.updateCaptureAreaHeight()
    }
  }

  const syncScroll = (e: Event): void => {
    const target = e.target as HTMLElement

    if (target === tableBodyRef.value && tableScrollRef.value) {
      // 表格滚动时，同步底部滚动条位置
      tableScrollRef.value.scrollLeft = target.scrollLeft
    } else if (target === tableScrollRef.value && tableBodyRef.value) {
      // 底部滚动条滚动时，同步表格位置
      tableBodyRef.value.scrollLeft = target.scrollLeft
    }
  }

  const initTableXScroll = (): void => {
    tableBodyRef.value = document.querySelector('[class$="-table-body"]')

    if (layoutScrollInfo && layoutScrollInfo.showTableXScroll) {
      tableScrollRef.value = layoutScrollInfo.tableScrollRef.value
      isEnabled.value = true
    } else {
      tableScrollRef.value = document.getElementById('cube-table-scroll-container')
      isEnabled.value = !!tableScrollRef.value
    }

    tableScrollContentRef.value = document.getElementById('cube-table-scroll-content')

    if (!tableBodyRef.value || !tableScrollRef.value || !tableScrollContentRef.value) {
      isEnabled.value = false
      return
    }

    updateTableXScroll()

    tableBodyRef.value.addEventListener('scroll', syncScroll)
    tableScrollRef.value.addEventListener('scroll', syncScroll)

    window.addEventListener('resize', updateTableXScroll)
  }

  if (layoutScrollInfo) {
    watch(() => layoutScrollInfo.tableScrollRef.value, (newVal) => {
      if (newVal && layoutScrollInfo.showTableXScroll) {
        // 当 tableScrollRef 变化时，重新初始化
        setTimeout(initTableXScroll, 100)
      }
    })
  }

  onMounted(() => {
    setTimeout(initTableXScroll, 100)
  })

  onBeforeUnmount(() => {
    if (tableBodyRef.value) {
      tableBodyRef.value.removeEventListener('scroll', syncScroll)
    }
    if (tableScrollRef.value) {
      tableScrollRef.value.removeEventListener('scroll', syncScroll)
    }
    window.removeEventListener('resize', updateTableXScroll)
  })

  return {
    initTableXScroll,
    updateTableXScroll,
    isEnabled
  }
}