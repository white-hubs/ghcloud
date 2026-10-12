import { Button, Input } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { ModalForm } from '@/components/modal-form/modal-form'
import type { QuestionCategory } from '@/types/exam-paper'

interface Props {
  value: QuestionCategory[];
}

export default defineComponent({
  emits: ['update:value'],
  props: ['value'],
  setup (props: Props, { emit }) {
    const value = ref<QuestionCategory[]>(props.value ?? [])

    watch(() => props.value, () => {
      value.value = props.value
    })

    const modalVisible = ref(false)
    const submitLoading = ref(false)
    const modalFormState = ref<{
      title: string;
    }>({
      title: '',
    })
    const modalRules = {
      title: [{ required: true, message: '请输大题标题', trigger: 'blur' }]
    }
    const formSource = ref([
      {
        label: '大题标题',
        value: 'title',
        component: Input,
        props: {
          placeholder: '请输入大题标题',
          maxLength: 20,
        }
      },
    ])

    const modalOk = async (): Promise<void> => {
      const item: QuestionCategory = {
        title: modalFormState.value.title,
        sort: value.value.length,
        examQuestions: []
      }
      value.value.push(item)
      modalVisible.value = false
      emit('update:value', value.value)
    }

    const add = (): void => {
      modalVisible.value = true
      modalFormState.value = {
        title: ''
      }
    }

    return (): JSX.Element =>
      <>
        <Button shape='round' type='primary' onClick={add}>添加大题</Button>
        <ModalForm
          title='添加大题'
          v-model:show={modalVisible.value}
          formSource={formSource.value}
          v-model:formState={modalFormState.value}
          rules={modalRules}
          onOk={modalOk}
          submitLoading={submitLoading.value}
        />
      </>
  }

})
