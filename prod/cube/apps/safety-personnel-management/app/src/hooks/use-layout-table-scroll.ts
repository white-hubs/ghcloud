import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

interface UseLayoutTableScroll {
  scrollY: Ref<number>;
  recalc: () => void;
}

export function useLayoutTableScroll (extraOffset = 16): UseLayoutTableScroll {
  const scrollY = ref(400)

  const calc = (): void => {
    const content = document.getElementById('cube-layout-content')
    if (!content) return
    const toolbar = content.querySelector('[data-layout-toolbar]') as HTMLElement | null
    const tabs = content.querySelector('[data-layout-tabs]') as HTMLElement | null
    const toolbarHeight = (toolbar?.offsetHeight ?? 0) + (tabs?.offsetHeight ?? 0)
    const tableHead = content.querySelector('.safety-personnel-management-table thead')?.clientHeight ?? 40
    scrollY.value = Math.max(content.clientHeight - toolbarHeight - tableHead - extraOffset, 200)
  }

  onMounted(() => {
    calc()
    window.addEventListener('resize', calc)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', calc)
  })

  return { scrollY, recalc: calc }
}
