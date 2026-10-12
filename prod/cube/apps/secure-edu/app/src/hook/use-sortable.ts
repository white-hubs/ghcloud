import { logger } from '@/logger'
import Sortable from 'sortablejs'
import { ref, onBeforeUnmount, nextTick, type Ref } from 'vue'

interface UseSortable {
  sortableInit: (elementSeletor: string, dragIcon: string) => void;
  sortable: Ref;
}

export const useSortable = (): UseSortable => {
  const sortable = ref<Sortable>()

  // 拖拽排序初始化
  const sortableInit = (elementSeletor: string, dragIcon: string): void => {
    nextTick(() => {
      const element = document.querySelector(elementSeletor)
      if (element) {
        sortable.value = new Sortable(element as HTMLElement, {
          animation: 150,
          handle: dragIcon,
          onEnd: function (evt): void {
            logger.debug(evt)
          }
        })
      }
    })
  }

  onBeforeUnmount(() => {
    sortable.value?.destroy()
  })
  return {
    sortableInit,
    sortable
  }
}
