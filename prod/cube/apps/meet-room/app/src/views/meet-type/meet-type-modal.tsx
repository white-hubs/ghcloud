import { Form, FormItem, Input, Modal, Switch, message, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, computed } from 'vue'
import type { MeetType as MeetTypeVo } from '@ghcloud/cube-meet-room-service'
import { cubeMeetRoomService } from '@/api/service'

interface Props {
  labelWidth: string;
  title: string;
}
type ActionType = 'add' | 'edit'
export const MeetTypeModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
    title: {
      type: String,
      default: '会议类型'
    },
  },
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const action = ref<ActionType>('add')
    const submitLoading = ref(false)
    const modalVisible = ref(false)

    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      status: boolean | undefined;
    }>({
      id: undefined,
      name: undefined,
      status: undefined,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
    }
    const handleOk = async (): Promise<void> => {
      await formRenderRef.value?.validate()
      try {
        submitLoading.value = true
        const params = {
          name: formState.name || null,
          status: formState.status || null,
        }
        if (action.value === 'add') {
          await cubeMeetRoomService.addMeetType(params)
        }
        if (action.value === 'edit') {
          await cubeMeetRoomService.updateMeetType(`${formState.id}`, params)
        }
        message.success('操作成功')
        modalVisible.value = false
        emit('enter')
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
      formRenderRef.value?.resetFields()
    }
    const openModal = async (record?: MeetTypeVo): Promise<void> => {
      action.value = 'add'
      formRenderRef.value?.resetFields()
      if (record?.id) {
        action.value = 'edit'
        Object.assign(formState, record)
        formState.status = record?.status
      } else {
        for (const key in formState) {
          (formState as Record<string, unknown>)[key] = undefined
        }
      }
      modalVisible.value = true
    }
    expose({
      openModal
    })
    const title = computed(() => {
      const res = action.value === 'add' ? `新增${props.title}` : action.value === 'edit' ? `编辑${props.title}` : `${props.title}`
      return res
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title={title.value}
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='600px'
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='类型名称' name='name'>
              <Input v-model:value={formState.name} placeholder='请输入类型名称' allowClear />
            </FormItem>
            <FormItem label='使用状态' name='status'>
              <Switch v-model:checked={formState.status} checked-children='启用' un-checked-children='停用' />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
