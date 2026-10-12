import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Input, type FormInstance } from '@ghcloud/cube-ui'
import type { FormState } from '../problem-degree'
export const EditModal = defineComponent({
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
      type: Object as PropType<FormState>,
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
    watch(() => props.formData, (val) => {
      if (props.state === 'create') return
      state.formState = val
    })
    const title = computed(() => {
      return props.state === 'create' ? '新增程度' : '编辑程度'
    })
    const handleOk = async (): Promise< void> => {
      await formRef.value?.validate()
      emit('save', state.formState)
    }
    return (): JSX.Element=> (
      <Modal
        title={title.value}
        width={600}
        onCancel={() => {
          emit('update:visible')
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
              message: '请输入名称'
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
