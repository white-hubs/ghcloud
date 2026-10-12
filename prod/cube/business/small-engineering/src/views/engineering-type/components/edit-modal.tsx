import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Input, type FormInstance } from '@ghcloud/cube-ui'
import type { FormState } from '../engineering-type'
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
      state.formState = val
    })
    const title = computed(() => {
      return props.state === 'create' ? '新增类型' : '编辑类型'
    })
    const handleOk = async (): Promise< void> => {
      await formRef.value?.validate()
      emit('save', state.formState)
    }
    return (): JSX.Element => (
      <Modal
        title={title.value}
        width={600}
        onCancel={() => {
          emit('update:visible')
        }}
        onOk={handleOk}
        v-model:visible={props.visible}
      >
        <Form
          ref={formRef}
          rules={{
            name: [{
              required: true,
              message: '请输入类型名称'
            }]
          }} model={state.formState}
        >
          <FormItem label='类型名称' name='type'>
            <Input v-model:value={state.formState.name} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
