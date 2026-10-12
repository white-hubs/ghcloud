import { cubeMessageCenterService } from '@/api/service'
import type { ChannelCodesType, ReferManufacturers, SatMsgChannels } from '@ghcloud/cube-message-center-service/src/types'
import { Form, FormItem, Input, Modal, message, type FormExpose, Select } from '@ghcloud/cube-ui'
import { debounce } from 'lodash'
import { defineComponent, reactive, ref } from 'vue'

interface DynamicFormState {
  channelCode: ChannelCodesType | undefined;
  manufacturerCode: string | undefined;
  [key: string]: string | undefined;
}
interface PropertyItem {
  type: string;
  title?: string;
  [key: string]: unknown;
}
export const ChannelConfigModal = defineComponent({
  emits: ['enter', 'cancel'],
  setup (props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const selectData = ref<SatMsgChannels | undefined>(undefined)
    const msgChannelsList = ref<SatMsgChannels[]>([])
    const serviceList = ref<ReferManufacturers[]>([])
    const selectAccountRule = ref<{ required: string[]; properties: Record<string, PropertyItem>; }>({ required: [], properties: {} })

    const formInstance = ref<FormExpose | undefined>(undefined)
    const formState = reactive<DynamicFormState>({
      channelCode: undefined,
      manufacturerCode: undefined,
    })

    const formRules = ref({
      manufacturerCode: [
        { required: true, message: '请选择服务商', trigger: 'blur' },
      ],
    })
    const getChannelManage = async (): Promise<void>=> {
      const res = await cubeMessageCenterService.satMsgChannels()
      msgChannelsList.value = res
    }
    const transformFieldData = (manufacturerItem: ReferManufacturers): void => {
      const accountRule = JSON.parse(manufacturerItem.accountRule as string)
      const properties = accountRule.properties ?? {}
      const requiredFields = accountRule.required ?? []

      selectAccountRule.value = { required: requiredFields, properties }

      // 初始化表单状态
      const configObj = selectData.value?.config ? JSON.parse(selectData.value.config) : {}
      Object.assign(formState, configObj)

      // 动态生成表单规则
      formRules.value = {
        manufacturerCode: [
          { required: true, message: '请选择服务商', trigger: 'blur' },
        ],
        ...Object.fromEntries(requiredFields.map((key: string | number) => [
          key,
          { required: true, message: `${properties[key]?.title ?? key} 是必填项`, trigger: 'blur' }
        ]))
      }
    }
    const changeManufacturer = async (): Promise<void>=> {
      const manufacturerItem = serviceList.value.find(item => item.code === formState.manufacturerCode)
      if (!manufacturerItem || !manufacturerItem.accountRule) {
        return
      }
      transformFieldData(manufacturerItem)
    }

    // 获取服务商数据并初始化表单
    const getData = async (data: SatMsgChannels): Promise<void> => {
      try {
        const res = await cubeMessageCenterService.getReferManufacturers(data.channelCode)
        serviceList.value = res
        formState.channelCode = data.channelCode
        formState.manufacturerCode = data?.manufacturerCode || serviceList.value[0]?.code
        if (!formState.manufacturerCode) {
          throw new Error('未找到有效的服务商')
        }
        const manufacturerItem = serviceList.value.find(item => item.code === formState.manufacturerCode && item.accountRule)
        if (!manufacturerItem || !manufacturerItem.accountRule) {
          return
        }
        transformFieldData(manufacturerItem)
      } catch {
      }
    }
    const openModal = (record: SatMsgChannels): void => {
      selectData.value = record
      modalVisible.value = true
      getData(record)
      getChannelManage()
    }

    // 重置表单
    const reset = (): void => {
      Object.keys(formState).forEach(key => {
        formState[key] = undefined
      })
      selectAccountRule.value = { required: [], properties: {} }
      formRules.value = {
        manufacturerCode: [
          { required: true, message: '请选择服务商', trigger: 'blur' },
        ],
      }
    }

    // 提交表单
    const handleOk = debounce(async () => {
      try {
        submitLoading.value = true
        await formInstance.value?.validate()

        const params = {
          channelCode: formState.channelCode,
          manufacturerCode: formState.manufacturerCode,
          config: JSON.stringify(formState),
        }
        await cubeMessageCenterService.saveSatMsgChannel(params)
        message.success('操作成功')
        modalVisible.value = false
      } catch {
      } finally {
        submitLoading.value = false
      }
      emit('enter')
      reset()
    }, 500)

    // 取消操作
    const handleCancel = (): void => {
      reset()
      emit('cancel')
      modalVisible.value = false
    }

    expose({
      openModal,
    })

    return (): JSX.Element => (
      <Modal
        title='渠道配置'
        visible={modalVisible.value}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={submitLoading.value}
      >
        <Form labelCol={{ style: { width: '150px' } }} model={formState} rules={formRules.value} ref={formInstance}>
          <FormItem label='渠道类型' name='channelCode'>
            <Select
              disabled
              v-model:value={formState.channelCode}
              options={msgChannelsList.value}
              getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode as HTMLElement}
              fieldNames={{ label: 'channelName', value: 'channelCode' }}
              placeholder='请选择渠道类型'
            />
          </FormItem>
          <FormItem label='服务商' name='manufacturerCode'>
            <Select
              v-model:value={formState.manufacturerCode}
              options={serviceList.value}
              getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode as HTMLElement}
              fieldNames={{ label: 'name', value: 'code' }}
              placeholder='请选择服务商'
              onChange={changeManufacturer}
            />
          </FormItem>
          {
            Object.keys(selectAccountRule.value.properties).map((key): JSX.Element | null => {
              const property = selectAccountRule.value.properties[key];
              return (
                <FormItem label={property.title ?? key} key={key} name={key}>
                  <Input
                    v-model:value={formState[key]}
                    placeholder={`请输入${property.title ?? key}`}
                    maxlength={500}
                  />
                </FormItem>
              );
            })
          }
        </Form>
      </Modal>
    )
  }
})