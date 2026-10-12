import { Button, DeleteOutlined, DragOutlined, Input, Radio, RadioGroup } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, type PropType, watch } from 'vue'
import styles from './question.module.less'
import { useSortable } from './use-sortable'
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
    const { questionItems, defaultItems, addItem, delItem } = useSortable('.question-items', props.action)
    const selectValue = ref('')
    watch(() => props.value, () => {
      questionItems.value = props.value.length ? props.value : defaultItems
      selectValue.value = questionItems.value.find(e => e.isRight)?.optionID ?? ''
    })
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
      default: (): JSX.Element[] => questionItems.value.map((e, index) => {
        const editBar = (
          <>
            <DragOutlined style={{ fontSize: '20px', marginLeft: '10px' }} class='drag-icon' />
            <DeleteOutlined style={{ fontSize: '20px', marginLeft: '10px', color: 'red' }} onClick={() => {
              delItem(index)
            }} />
          </>
        )
        return (
          <Radio value={e.optionID} key={index} style={{ display: 'flex' }} v-model:checked={e.isRight}>
            <div class={styles['question-item']}>
              <span class={styles['question-optionID']}>{e.optionID}</span>
              {props.readonly ? e.optionTitle : <Input v-model:value={e.optionTitle} placeholder='输入选项' />}
              {props.readonly ? '' : editBar}
            </div>
          </Radio>
        )
      })
    }

    watch(() => selectValue.value, () => {
      questionItems.value.forEach(e => {
        e.isRight = selectValue.value === e.optionID
      })
    })

    return (): JSX.Element =>
      <>
        <div class={styles['question-body']}>
          <RadioGroup
            v-slots={radioGroupSlot}
            class='question-items'
            v-model:value={selectValue.value}
            readonly={props.readonly}
            optionType='default'
          />
        </div>
        {props.readonly ? '' : <Button type='primary' shape='round' size='small' onClick={addItem}>添加选项</Button>}
      </>
  }
})
