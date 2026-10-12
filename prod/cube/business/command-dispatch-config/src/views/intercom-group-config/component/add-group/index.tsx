import { AntModal, Form, FormItem, InputNumber, Input, Switch, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, watch, type PropType } from 'vue'
import { addInterComGroup, updateInterComGroup } from '@/apis/intercom-group-config'
interface FormState {
  id: string;
  code: string;
  name: string;
  isRecord: boolean;
  type: number;
  groupLevel: number | null;
}
export const AddGroup = defineComponent({
  props: {
    initFormState: {
      type: Object as PropType<FormState>,
      default: () => {
        return {
          id: '',
          name: '',
          groupLevel: '',
          type: 0,
          isRecord: true,
          code: ''
        }
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增对讲组'
    },
  },
  emits: ['update:visible', 'getList', 'update:initFormState'],
  setup: (props, { emit }) => {
    const formRef = ref<{ validate: () => Promise<void>; }>()
    const state = reactive<{
      loading: boolean;
      formState: {
        id: string;
        code: string;
        name: string;
        isRecord: boolean;
        type: number;
        groupLevel: number | null;
      };
    }>({
      loading: false,
      formState: {
        id: '',
        code: '',
        name: '',
        groupLevel: null,
        type: 0,
        isRecord: true,
      }
    })
    const handleOk = async (): Promise<void> => {
      try {
        await formRef.value?.validate()
        state.loading = true
        if (!state.formState.id) {
          await addInterComGroup(state.formState)
        } else {
          await updateInterComGroup(state.formState)
        }
        message.success(`${!state.formState.id ? '新增' : '编辑'}成功`)
        handleCancel()
        emit('getList')
      } catch {
      } finally {
        state.loading = false
      }
    }
    watch(() => props.initFormState, () => {
      state.formState = props.initFormState
    })
    const handleCancel = (): void => {
      emit('update:visible', false)
      emit('update:initFormState', {
        id: '',
        name: '',
        groupLevel: '',
        type: 0,
        isRecord: true,
        code: ''
      })
    }
    const rules = {
      code: [{ required: true, message: '请输入对讲组编号' }],
      name: [{ required: true, message: '请输入对讲组名称' }],
      groupLevel: [{ required: true, message: '请输入账号等级' }],
    }
    return (): JSX.Element=> (
      <>
        <AntModal
          v-model:visible={props.visible}
          title={props.title}
          width={800}
          maskClosable={false}
          confirmLoading={state.loading}
          onOk={handleOk}
          onCancel={handleCancel}
        >

          <Form ref={formRef} labelCol={{ span: 4 }} model={state.formState} rules={rules}>
            <FormItem label='对讲组编号:' name='code'>
              <InputNumber min={0} max={99999} placeholder='输入对讲组编号' v-model:value={state.formState.code} />
            </FormItem>
            <FormItem label='对讲组名称:' name='name'>
              <Input placeholder='输入对讲组名称' v-model:value={state.formState.name} />
            </FormItem>
            <FormItem label='输入账号等级:' name='groupLevel'>
              <InputNumber min={0} max={100} precision={0} style={{ width: '200px' }} v-model:value={state.formState.groupLevel} />
            </FormItem>
            <FormItem label='是否录音:' name='isRecord' required>
              <Switch v-model:checked={state.formState.isRecord} checkedChildren='是' unCheckedChildren='否' />
            </FormItem>
          </Form>
        </AntModal>
      </>
    )
  }
})
