import { type QuestionRow, QuestionTypeEnum } from '@/types/question'
import { Question } from '@/views/system-config/components/question/question'
import { Modal } from '@ghcloud/cube-ui'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import { defineComponent, ref, type PropType, watch, computed } from 'vue'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'

interface Props {
  title: string;
  show: boolean;
  action: string;
  formData: QuestionRow;
}

export const AddQuestionModal = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    },
    action: {
      type: String,
      default: ''
    },
    formData: {
      type: Object as PropType<QuestionRow>,
      default: () => ({})
    },
  },
  emits: ['update:show', 'ok', 'update:formData'],
  setup: (props: Props, { emit }) => {
    const cancel = (): void => {
      emit('update:show', false)
    }
    const ok = async (): Promise<void> => {
      await dynamicFormRenderRef.value?.formRef.validate()
      emit('update:formData', formData.value)
      emit('ok')
    }

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed((): DynamicFormRenderOptionProps[] => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '题目主题', key: 'themeId', width: 46, customComponent: ThemeSelectInput, required: true },
        {
          title: '题目类型',
          key: 'questionType',
          width: 46,
          componentName: 'SelectInput',
          required: true,
          componentProps: {
            options: [
              { label: '单选题', value: 'SINGLE_CHOICE' },
              { label: '多选题', value: 'MULTIPLE_CHOICE' },
              { label: '判断题', value: 'JUDGE' }
            ]
          },
        },
        { title: '题目名称', key: 'name', width: 92, componentName: 'TextareaInput', componentProps: { maxlength: 1000 }, required: true },
        {
          title: '题目',
          key: 'questionContent',
          width: 92,
          customComponent: Question,
          componentProps: {
            action: props.action
          },
          required: true,
          hiddenLabel: true,
          dependentParams: ['questionType']
        },
        { title: '解析', key: 'answerAnalysis', width: 46, componentName: 'TextareaInput' },
        { title: '分数', key: 'score', width: 46, componentName: 'NumberInput', componentProps: { maxlength: 10 }, required: true },
      ]
      if (props.action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref<QuestionRow>(props.formData ?? {
      themeId: undefined,
      questionType: QuestionTypeEnum.SINGLE_CHOICE,
      name: '',
      questionContent: '',
      answerAnalysis: '',
      score: ''
    })
    watch(() => props.formData, () => {
      formData.value = props.formData
    })

    const validateQustion = async (): Promise<void> => {
      if (!formData.value.questionContent) {
        return Promise.reject(new Error('题目数据为空'))
      }
      const data = formData.value.questionContent as unknown as { optionTitle: string;['optionID']: string;isRight: boolean; }[]
      for (const item of data) {
        if (!item.optionTitle) {
          return Promise.reject(new Error(`选项${item.optionID}不能为空`))
        }
      }
      const arr = [...new Set(data.map(e => e.optionTitle.trim()))]
      if (arr.length < data.length) {
        return Promise.reject(new Error('选项中有重复项'))
      }
      if (data.findIndex(e => e.isRight) === -1) {
        return Promise.reject(new Error('当前无正确选项'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      questionContent: {
        required: true,
        trigger: 'blur',
        validator: validateQustion
      } satisfies RuleObject
    }

    return (): JSX.Element =>
      <Modal
        visible={props.show}
        title={props.title}
        destroyOnClose
        onCancel={cancel}
        onOk={ok}
        width='1000px'
      >
        <DynamicFormRender
          formOptions={options.value}
          customValidatesRules={customValidatesRules}
          labelWidth='150px'
          v-model:formData={formData.value}
          ref={dynamicFormRenderRef}
          style={{ margin: '20px' }}
        />
      </Modal>
  }
})
