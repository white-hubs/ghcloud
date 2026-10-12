import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, type FormInstance, Input } from '@ghcloud/cube-ui'
import type { FormState } from '../fault-type'
export const TypeModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object as PropType<FormState>,
      default: () => ({

      })
    }
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    const formState = reactive({
      name: undefined,
      id: undefined,

    })
    const formRef = ref<FormInstance>()
    watch(() => props.formData, (val) => {
      Object.assign(formState, val)
    })
    const handleOk = async (): Promise< void> => {
      await formRef.value?.validate()
      emit('save', formState)
    }
    return () => (
      <Modal
        title={props.formData?.id ? '编辑类型' : '新增类型'}
        width={600}
        onCancel={() => {
          emit('update:visible')
          formState.name = undefined
          formState.id = undefined
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
            }],
          }} model={formState}
        >
          <FormItem label='类型名称' name='name'>
            <Input
              placeholder='请输入名称'
              v-model:value={formState.name}
            />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
