import { defineComponent, ref, type PropType, computed, h, watch } from 'vue'
import QuestionCheckbox from './question-checkbox'
import QuestionRadio from './question-radio'
import QuestionDetermine from './question-determine'
import type { QuestionItem } from '@/types/question'

type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'JUDGE'
interface Props {
  questionType: QuestionType;
  formData: Record<string, unknown>;
  dependentParams: string[];
  value: QuestionItem[] | null;
  readonly: boolean;
}
export const Question = defineComponent({
  emits: ['update:value'],
  props: {
    questionType: {
      type: String as PropType<QuestionType>,
      default: 'radio'
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    dependentParams: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    value: {
      type: Array as PropType<QuestionItem[]>,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
  },
  setup (props: Props, { emit }) {
    const questionType = ref<QuestionType>((props.formData[props.dependentParams[0]] ?? 'SINGLE_CHOICE') as QuestionType)
    const value = ref<QuestionItem[]>(props.value ?? [])
    watch(() => props.formData[props.dependentParams[0]], () => {
      questionType.value = props.formData[props.dependentParams[0]] as QuestionType ?? 'SINGLE_CHOICE'
      if (!props.readonly) {
        value.value = []
      }
    })
    watch(() => value.value, () => {
      emit('update:value', value.value)
    }, { deep: true })
    watch(() => props.value, () => {
      value.value = props.value ?? []
    })

    const component = computed(() => {
      if (questionType.value === 'MULTIPLE_CHOICE') {
        return QuestionCheckbox
      } else if (questionType.value === 'SINGLE_CHOICE') {
        return QuestionRadio
      } else {
        return QuestionDetermine
      }
    })

    return (): JSX.Element => h(component.value, {
      readonly: props.readonly,
      value: value.value,
      'onUpdate:value': (val: QuestionItem[]) => {
        value.value = val
      }
    })
  }
})
