import { Radio, RadioGroup } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, type PropType, watch } from 'vue'
import styles from './question.module.less'
import type { QuestionItem } from '@/types/question'

interface Props {
  action: 'add' | 'edit' | 'detail';
  value: QuestionItem[];
  readonly: boolean;
}
export default defineComponent({
  props: {
    action: {
      type: String as PropType<'add' | 'edit' | 'detail'>,
      default: ''
    },
    value: {
      type: Array as PropType<QuestionItem[]>,
      default: []
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  setup (props: Props, { emit }) {
    const defaultItems = [
      {
        sort: 0,
        optionTitle: '正确',
        optionID: 'A',
        isRight: false,
        isCheck: false
      },
      {
        sort: 1,
        optionTitle: '错误',
        optionID: 'B',
        isRight: false,
        isCheck: false
      }
    ]
    const questionItems = ref(defaultItems)

    watch(() => questionItems.value, () => {
      selectValue.value = questionItems.value.find(e => e.isRight)?.optionID ?? ''
    })
    onMounted(() => {
      if (props.action === 'add') {
        emit('update:value', questionItems.value)
      } else {
        questionItems.value = props.value.length ? props.value : defaultItems
      }
    })

    // 插槽
    const radioGroupSlot = {
      default: (): JSX.Element [] => questionItems.value.map((e, index) => {
        return (
          <Radio value={e.optionID} key={index} style={{ display: 'flex' }} v-model:checked={e.isRight}>
            <div class={styles['question-item']}>
              <span class={styles['question-optionID']}>{e.optionID}</span>
              {e.optionTitle}
            </div>
          </Radio>
        )
      })
    }

    const selectValue = ref('')
    watch(() => selectValue.value, () => {
      questionItems.value.forEach(e => {
        e.isRight = selectValue.value === e.optionID
      })
    })

    return (): JSX.Element =>
      <>
        <div class={styles['question-body']}>
          <RadioGroup
            v-slots={radioGroupSlot} class='question-items' v-model:value={selectValue.value} readonly={props.readonly}
          />
        </div>
      </>
  }
})
