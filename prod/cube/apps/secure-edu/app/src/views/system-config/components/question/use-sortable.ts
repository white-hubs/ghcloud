import type { QuestionItem } from '@/types/question'
import { message } from '@ghcloud/cube-ui'
import Sortable from 'sortablejs'
import { ref, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'

interface UseSortable {
  questionItems: Ref<QuestionItem[]>;
  addItem: () => void;
  delItem: (index: number) => void;
  defaultItems: QuestionItem[];
}

type Action = 'add' | 'edit' | 'detail'

export const useSortable = (elementSeletor: string, action: Action): UseSortable => {
  const sortable = ref<Sortable>()
  const questionItems = ref<QuestionItem[]>([])
  const transNumberToOptionId = (num: number): string => {
    return String.fromCharCode(64 + parseInt((num + 1).toString()))
  }

  // optionID 选项字母重置
  const resortOptionId = (): void => {
    questionItems.value.forEach((e, i) => {
      e.sort = i + 1
      e.optionID = transNumberToOptionId(i)
    })
  }

  // 删除选项
  const delItem = (index: number): void => {
    if (questionItems.value.length <= 2) {
      message.warn('至少需要保留两个选项')
      return
    }
    questionItems.value.splice(index, 1)
    resortOptionId()
  }
  // 添加选项
  const addItem = (): void => {
    const item: QuestionItem = {
      sort: questionItems.value.length,
      optionTitle: '',
      optionID: transNumberToOptionId(questionItems.value.length),
      isRight: false,
      isCheck: false
    }
    questionItems.value.push(item)
  }

  // 拖拽排序初始化
  const sortableInit = (): void => {
    nextTick(() => {
      const element = document.querySelector(elementSeletor)
      if (element) {
        sortable.value = new Sortable(element as HTMLElement, {
          animation: 150,
          handle: '.drag-icon',
          onEnd: function (evt): void {
            const { newIndex, oldIndex } = evt
            if (newIndex !== undefined && oldIndex !== undefined) {
              const arr = questionItems.value
              const currRow = arr.splice(oldIndex, 1)[0]
              arr.splice(newIndex, 0, currRow)
              questionItems.value = []
              nextTick(() => {
                questionItems.value = arr
                resortOptionId()
              })
            }
          }
        })
      }
    })
  }

  // 默认4个空选项
  const defaultItems: QuestionItem[] = []
  for (let index = 0; index < 4; index++) {
    const item: QuestionItem = {
      sort: index,
      optionTitle: '',
      optionID: transNumberToOptionId(index),
      isRight: false,
      isCheck: false
    }
    defaultItems.push(item)
  }

  onMounted(() => {
    if (action === 'add') {
      questionItems.value = defaultItems
    }
    if (action === 'add' || action === 'edit') {
      sortableInit()
    }
  })
  onBeforeUnmount(() => {
    sortable.value?.destroy()
  })
  return { questionItems, addItem, delItem, defaultItems }
}
