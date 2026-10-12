import { Button, Form, FormItem, Modal, Select, message, Textarea, InputNumber, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { cubeMeetRoomService } from '@/api/service'
import type { ConferenceInfoVo, DisplayStatus } from '@ghcloud/cube-meet-room-service'
import { DeviceModalTable } from '@/components/device-modal-table/device-modal-table'

interface Props {
  labelWidth: string;
}
export const AddSetModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '100px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)

    const formRef = ref<FormExpose>()
    const formState = reactive<{
      deviceIds: string[];
      authInfo?: null | string;
      conferenceId?: number | null;
      cronExpression?: number | null;
      deviceCode?: null | string;
      deviceName?: null | string;
      displayStatus?: DisplayStatus;
      id?: string | number | null;
      jobId?: number | null;
      programUrl?: null | string;
    }>({
      deviceIds: []
    })
    const meetList = ref<ConferenceInfoVo[]>([])
    const deviceList = ref<{ name: string; deviceId: string; id: string; code: string; }[]>([])

    const handleOk = async (): Promise<void> => {
      await formRef.value?.validate()
      try {
        submitLoading.value = true
        const params = {
          conferenceId: formState.conferenceId || null,
          deviceName: deviceList.value[0].name || null,
          deviceCode: deviceList.value[0].code || null,
          cronExpression: formState.cronExpression || null,
          authInfo: formState.authInfo || '',
          programUrl: formState.programUrl || null,
        }
        await cubeMeetRoomService.saveRoomScreenConfig(params)
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
      formRef.value?.resetFields()
    }
    const resetForm = (): void => {
      Object.assign(formState, {
        deviceIds: []
      })
    }
    const deviceModalTableRef = ref<{ openModal: () => void; }>()

    const checkDeviceList = async (): Promise<void> => {
      if (!formState.deviceIds || formState.deviceIds.length === 0) {
        return Promise.reject(new Error('请选择设备'))
      }
      return Promise.resolve()
    }
    const modalRules = {
      deviceList: [{ validator: checkDeviceList }],
      conferenceId: [{ required: true, message: '请选择会议室', trigger: 'blur' }],
    }
    const selectDevice = async (): Promise<void> => {
      deviceModalTableRef.value?.openModal()
    }
    const getMeetList = async (keyword?: string): Promise<void> => {
      const res = await cubeMeetRoomService.getConferenceList({ keyword: keyword || '' })
      meetList.value = res ?? []
    }
    onMounted(() => {
      getMeetList()
    })
    const openModal = (): void => {
      modalVisible.value = true
      formRef.value?.resetFields()
      resetForm()
    }

    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='新增设置'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='600px'
        >
          <Form model={formState} ref={formRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='选择设备' name='deviceIds' required>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  style={{ width: '286px' }}
                  open={false}
                  showArrow={false}
                  mode='multiple'
                  options={deviceList.value}
                  v-model:value={formState.deviceIds}
                  placeholder='请选择会议室设备'
                  fieldNames={{ label: 'name', value: 'id' }}
                  getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                  maxTagCount={2}
                  onChange={() => {
                    deviceList.value = deviceList.value.filter(i => formState.deviceIds?.includes(i.id))
                  }}
                />
                <Button type='primary' onClick={selectDevice}>选择设备</Button>
              </div>
            </FormItem>
            <FormItem label='选择会议室' name='conferenceId'>
              <Select
                options={meetList.value}
                fieldNames={{ label: 'name', value: 'id' }}
                showSearch
                optionFilterProp='name'
                v-model:value={formState.conferenceId}
                style={{ width: '374px' }}
                allowClear
                placeholder='请选择会议室'
              />
            </FormItem>
            <FormItem label='自动刷新时间' name='cronExpression'>
              <div style={{ display: 'flex', alignItems: 'center', width: '400px' }}>
                <InputNumber
                  v-model:value={formState.cronExpression}
                  placeholder='请输入自动刷新时间'
                  allowClear
                  style={{ marginRight: '10px' }}
                /> 秒
              </div>
            </FormItem>
            <FormItem label='节目接口地址' name='programUrl'>
              <Textarea
                style={{ width: '400px' }}
                v-model:value={formState.programUrl} placeholder='请输入节目接口地址'
                allowClear
              />
            </FormItem>
            <FormItem label='鉴权信息' name='authInfo'>
              <Textarea
                style={{ width: '400px' }}
                v-model:value={formState.authInfo} placeholder='请输入鉴权信息'
                allowClear
              />
            </FormItem>
          </Form>
        </Modal>
        <DeviceModalTable
          ref={deviceModalTableRef}
          searchParams={{ applicationCode: __ENV__.applicationCode }}
          v-model:value={deviceList.value}
          multiple={false}
          onOk={(values: { deviceName: string; deviceId: string; id: string; code: string; }[]) => {
            formState.deviceIds = values.map(e => {
              return e.id
            })
            deviceList.value = values.map(e => {
              return { name: e.deviceName, id: e.id, deviceId: e.deviceId, code: e.code }
            })
          }}
        />
      </>
  }
})
