import { cubeMessageCenterService } from '@/api/service'
import { ReceiveMode, type MsgTemplate, type User } from '@ghcloud/cube-message-center-service/src/types'
import { Button, Form, FormItem, Modal, RadioGroup, message, type FormExpose } from '@ghcloud/cube-ui'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { UserPickerModal } from '@ghcloud/generic-component'
import { debounce } from 'lodash'
import { defineComponent, reactive, ref } from 'vue'

export const ReceiveModal = defineComponent({
  emits: ['enter', 'cancel'],
  setup (props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const msgRecord = ref<MsgTemplate>()

    const formInstance = ref<FormExpose>()
    const formRules = {
      receiveMode: [{ required: false, message: '请输入消息接收方式', trigger: 'blur' }],
    }
    const formState = reactive<{
      receiveMode: ReceiveMode | undefined;
      users: string[] | undefined;
    }>({
      receiveMode: undefined,
      users: []
    })
    const userPickerModalRef = ref<{ openModal: () => void; }>()
    const users = ref<{ id: string; name: string; }[]>([])
    const addUser = (): void => {
      userPickerModalRef.value?.openModal()
    }
    const usersHandle = async (val: { id: string; name: string; organizations: { id: string;name: string; }[]; }[]): Promise<void> => {
      users.value = val?.map(e => {
        return {
          id: e.id,
          name: e.name,
        }
      })
      formState.users = val?.map(e => e.id)
    }
    const getReceiveDetail = async (code: string): Promise<void> => {
      try {
        const res = await cubeMessageCenterService.getMsgSceneReceiveDetail(code)
        formState.receiveMode = res?.receiveMode
        formState.users = res?.users?.map(e => e.userId)
        users.value = res?.users?.map(e => {
          return {
            name: e.userName,
            id: e.userId
          }
        }) ?? []
      } catch {
      }
    }
    const openModal = async (record: MsgTemplate): Promise<void> => {
      msgRecord.value = record
      modalVisible.value = true
      getReceiveDetail(record.msgSceneCode)
    }
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      users.value = []
    }
    const handleOk = debounce(async () => {
      try {
        submitLoading.value = true
        const params: { receiveMode: ReceiveMode | undefined; users?: User[]; } = {
          receiveMode: formState.receiveMode,
          users: []
        }
        if (formState.receiveMode === ReceiveMode.SPECIFY_USER) {
          params.users = users.value?.map(e => {
            return {
              userId: e.id,
              userName: e.name
            }
          })
        }
        await cubeMessageCenterService.updateMsgSettingMode(msgRecord.value?.id ?? '', params)
        message.success('操作成功')
        modalVisible.value = false
      } catch {
      } finally {
        submitLoading.value = false
      }
      emit('enter')
      reset()
    }, 500)
    const handleCancel = (): void => {
      modalVisible.value = false
      emit('cancel')
      reset()
    }

    expose({
      openModal,
    })

    return (): JSX.Element =>
      <>
        <Modal
          title='消息接收模式'
          visible={modalVisible.value}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={submitLoading.value}
        >
          <Form style={{ margin: '0 0 0 40px' }} model={formState} rules={formRules} ref={formInstance}>
            <FormItem label='接收模式' name='receiveMode'>
              <RadioGroup
                v-model:value={formState.receiveMode}
                options={[
                  { label: '自动获取', value: 'DYNAMIC_APPLICATION' },
                  { label: '指定用户', value: 'SPECIFY_USER' },
                ]}
              />
            </FormItem>
          </Form>
          {formState.receiveMode === ReceiveMode.SPECIFY_USER &&
            <FormItem label='' name='users'>
              <Select
                v-model:value={formState.users}
                style={{ margin: '0 0 0  100px', width: '60%' }}
                options={users.value}
                open={false}
                showArrow={false}
                allowClear={false}
                mode='multiple'
                getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                fieldNames={{ label: 'name', value: 'id' }}
                maxTagCount={3}
              />
              <Button type='primary' onClick={addUser}>选择人员</Button>
            </FormItem>}
        </Modal>
        <UserPickerModal multiple ref={userPickerModalRef} v-model:value={users.value} onUpdate:value={usersHandle} />
      </>
  }
})
