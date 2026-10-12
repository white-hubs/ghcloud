import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Input, type FormInstance } from '@ghcloud/cube-ui'
import type { ClassifyFormState } from '../problem-type'
export const EditClassifyModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    state: {
      type: String,
      default: 'create'
    },
    formData: {
      type: Object as PropType<ClassifyFormState>,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    const state = reactive({
      formState: {
        name: ''
      }
    })
    const formRef = ref<FormInstance>()
    watch(() => props.visible, (val) => {
      if (val) {
        if (props.state === 'create') return
        state.formState = props.formData
      }
    })
    const title = computed(() => {
      return props.state === 'create' ? '新增分类' : '编辑分类'
    })
    const handleOk = async (): Promise< void> => {
      await formRef.value?.validate()
      emit('save', state.formState)
      formRef.value?.resetFields()
    }
    return (): JSX.Element => (
      <Modal
        title={title.value}
        width={600}
        onCancel={() => {
          formRef.value?.resetFields()
          formRef.value?.clearValidate()
          emit('update:visible', false)
        }}
        destroyOnClose
        onOk={handleOk}
        v-model:visible={props.visible}
      >
        <Form
          ref={formRef}
          rules={{
            name: [{
              required: true,
              message: '请输入名称',
            }]
          }} model={state.formState}
        >
          <FormItem label='名称' name='name'>
            <Input v-model:value={state.formState.name} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
