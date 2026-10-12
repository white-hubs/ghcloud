import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Form, FormItem, Modal, Input, Row, Col, InputNumber, type FormInstance } from '@ghcloud/cube-ui'
export const EditModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    formState: {
      type: Object as PropType<{
        id: string;
        name: string;
        size: string;
        number: string;
        manufacturer: string;
        model: string;
      }>,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const state = reactive({
      formState: {
        id: '',
        name: '',
        size: '',
        number: '',
        manufacturer: '',
        model: ''
      }
    })
    const formRef = ref<FormInstance>()
    watch(() => props.formState, () => {
      state.formState = props.formState
    })
    const handleOk = async (): Promise <void> => {
      await formRef.value?.validate()
      emit('ok', {
        ...state.formState
      })
    }
    return (): JSX.Element => (
      <Modal
        v-model:visible={props.visible} title='新增物品' onOk={handleOk} onCancel={() => {
          emit('update:visible', false)
        }}
      >
        <Form
          ref={formRef}
          style={{ margin: '0' }} labelCol={{
            style: {
              width: '90px'
            }
          }}
          model={state.formState}
        >
          <FormItem label='物品名称' name='name'>
            <Input placeholder='请输入物品名称' v-model:value={state.formState.name} />
          </FormItem>
          <Row>
            <Col span={12}>
              <FormItem label='尺寸'>
                <Input placeholder='请输入物品尺寸' v-model:value={state.formState.size} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='数量'>
                <InputNumber placeholder='请输入物品数量' min={0} precision={0} max={99999999} v-model:value={state.formState.number} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label='厂家'>
                <Input placeholder='请输入物品所属厂家' v-model:value={state.formState.manufacturer} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='型号'>
                <Input placeholder='请输入物品型号' v-model:value={state.formState.model} />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
})
