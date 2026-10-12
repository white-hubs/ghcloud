import { computed, defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { Modal, Form, FormItem, Input, type FormInstance, Select } from '@ghcloud/cube-ui'
import type { ClassifyFormState } from '../problem-type'
import type { HiddenDangerType } from '@ghcloud/cube-maintain-service'

export const EditTypeModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    state: {
      type: String,
      default: 'create'
    },
    classifyOptions: {
      type: Array as PropType<ClassifyFormState[]>,
      default: () => []
    },
    formData: {
      type: Object as PropType<HiddenDangerType>,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'save'],
  setup: (props, { emit }) => {
    const state = reactive<{
      formState: {
        name: string;
        hiddenDangerCategoryId: string | null;
        hiddenDangerCategoryName: string;
      };
    }>({
      formState: {
        name: '',
        hiddenDangerCategoryId: null,
        hiddenDangerCategoryName: ''
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
      return props.state === 'create' ? '新增类型' : '编辑类型'
    })
    const handleOk = async (): Promise< void> => {
      await formRef.value?.validate()
      emit('save', state.formState)
      formRef.value?.resetFields()
    }
    return (): JSX.Element=> (
      <Modal
        title={title.value}
        width={600}
        destroyOnClose
        onCancel={() => {
          formRef.value?.resetFields()
          formRef.value?.clearValidate()
          emit('update:visible', false)
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
            hiddenDangerCategoryId: [{
              required: true,
              message: '请选择隐患分类'
            }]
          }} model={state.formState}
        >
          <FormItem label='类型名称' name='name'>
            <Input v-model:value={state.formState.name} />
          </FormItem>

          <FormItem label='类型名称' name='hiddenDangerCategoryId'>
            <Select
              v-model:value={state.formState.hiddenDangerCategoryId}
              options={props.classifyOptions}
              placeholder='请选择隐患分类'
              onSelect={(value: string, option: ClassifyFormState) => {
                state.formState.hiddenDangerCategoryName = option.name
              }}
              fieldNames={{
                label: 'name',
                value: 'id'
              }}
              style={{ width: '100%' }}
            />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})
