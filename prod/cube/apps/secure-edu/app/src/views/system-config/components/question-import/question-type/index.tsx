import { CheckboxGroup, Form, FormItem, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref } from 'vue'

export interface QuestionRule {
  name: string; unit: string; id: string;
}
interface Props {
  value: string[];
  title: string;
}

export const QuestionType = defineComponent({
  props: ['value', 'title'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit, expose }) => {
    const formRef = ref<FormExpose>()
    const formState = reactive({
      ids: undefined
    })
    const formRules = {
      ids: [{ required: true, message: '请选择考题类型', trigger: 'blur' }],
    }
    const checkTypeOptions = ref<{ label: string; value: string; }[]>([])
    const getVacationType = async (): Promise<void> => {
      try {
        // const res = await getQuestionRuleNotLimit()
        // if (res.data) {
        //   checkTypeOptions.value = res.data && Array.isArray(res.data)
        //     ? res.data.map((item: QuestionRule) => {
        //       return {
        //         label: item.name,
        //         value: item.id
        //       }
        //     })
        //     : []
        // }
      } catch {
      }
    }
    onMounted(() => {
      getVacationType()
    })
    expose({
      formRef
    })
    return (): JSX.Element =>
      <>
        <Form ref={formRef} model={formState} labelCol={{ style: { width: '80px' } }} rules={formRules}>
          <FormItem label='考题类型' name='ids' style={{ paddingTop: '10px' }}>
            <CheckboxGroup
              v-model:value={formState.ids}
              options={checkTypeOptions.value}
              onChange={(val: string[]) => {
                emit('update:value', val)
                const list = checkTypeOptions.value.filter(item => val.includes(item.value))
                emit('change', list)
              }}
            />
          </FormItem>
        </Form>
      </>
  }
})
