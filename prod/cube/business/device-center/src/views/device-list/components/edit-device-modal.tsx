
import { cubeDeviceCenterInternalService } from '@/api/service'
import { debounce } from '@/utils/tool'
import { Form, FormItem, Input, Modal, PopOver, Textarea, message, CheckCircleOutlined } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive } from 'vue'
import { RelateSubDevice } from './relate-sub-device'

interface Props {
  id: string;
  labelWidth: string;
}
export const EditDeviceModel = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const formRenderRef = ref()
    const modalRules = {
      deviceNumber: [{ required: true, message: '请输入设备序列号', trigger: 'blur' }],
      deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    }
    const formState = reactive< {
      deviceNumber: string;
      deviceName: string;
      deviceType: number;
      remark: string;
      rawDeviceId: string; // 三发id
      config: string; // 物联配置
      relationDeviceIds: { id: string; name: string; }[] | undefined;
    }>({
      deviceNumber: '',
      deviceName: '',
      deviceType: 1, // 设备类型 1真实设备; 0虚拟设备
      remark: '',
      rawDeviceId: '',
      config: '',
      relationDeviceIds: []
    })
    const handleOk = debounce(() => {

      formRenderRef.value.validate().then(async () => {
        try {
          submitLoading.value = true
          const params = {
            deviceId: props.id,
            config: formState.config,
            rawDeviceId: formState.rawDeviceId,
            deviceNumber: formState.deviceNumber,
            name: formState.deviceName,
            relationDeviceIds: formState.relationDeviceIds?.filter(e => e.id !== props.id)?.map(e => e.id).join(',') ?? '',
          }
          await cubeDeviceCenterInternalService.updateDevice(params)
          message.success('操作成功')
          modalVisible.value = false
          emit('enter')
        } catch {
        } finally {
          submitLoading.value = false
        }
      })
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      formRenderRef.value.clearValidate()
      formRenderRef.value.resetFields()
    }
    const getSubDeviceList = async (slaveDeviceIds: string | null): Promise<void> => {
      try {
        if (!slaveDeviceIds) return;
        const subList = await cubeDeviceCenterInternalService.getDeviceList({ deviceIds: slaveDeviceIds || '' });
        if (subList) {
          formState.relationDeviceIds = subList?.map(e => ({ id: (e as { id: string; }).id, name: (e as { name: string; }).name })) || [];
        }
      } catch {
      }
    }
    const showSyncTip = ref(true)
    const openModal = (info: {
      deviceNumber: string;
      deviceName: string;
      name: string;
      deviceType: number;
      remark: string;
      rawDeviceId: string; // 三发id
      config: string; // 物联配置
      slaveDeviceIds: string;
      edgeDevIdentify?: string;
    }): void => {
      if (formRenderRef.value) {
        formRenderRef.value.resetFields()
      }
      modalVisible.value = true
      formState.deviceNumber = info.deviceNumber
      formState.deviceName = info.deviceName || info.name
      formState.rawDeviceId = info.rawDeviceId
      formState.config = info.config
      getSubDeviceList(info.slaveDeviceIds)
      showSyncTip.value = !!(info?.edgeDevIdentify && info?.edgeDevIdentify !== '')
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='编辑设备'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='设备序列号' name='deviceNumber'>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  style={{ width: '480px' }}
                  v-model:value={formState.deviceNumber} placeholder='请输入设备序列号'
                  allowClear
                  maxlength={100}
                />
                {showSyncTip.value && (
                  <PopOver content="设备名称、编码可同步到接入层" placement="right">
                    <div style={{ marginLeft: '8px', cursor: 'pointer', color: '#52c41a', fontSize: '18px' }}>
                      <CheckCircleOutlined />
                    </div>
                  </PopOver>
                )}
              </div>
            </FormItem>
            <FormItem label='设备名称' name='deviceName'>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  style={{ width: '480px' }}
                  v-model:value={formState.deviceName} placeholder='请输入设备名称'
                  allowClear
                  maxlength={200}
                />
                {showSyncTip.value && (
                  <PopOver content="设备名称、编码可同步到接入层" placement="right">
                    <div style={{ marginLeft: '8px', cursor: 'pointer', color: '#52c41a', fontSize: '18px' }}>
                      <CheckCircleOutlined />
                    </div>
                  </PopOver>
                )}
              </div>
            </FormItem>
            <FormItem label='关联子设备' name='relationDeviceIds'>
              <RelateSubDevice mainDeviceId={props.id} v-model:value={formState.relationDeviceIds} />
            </FormItem>
            <FormItem label='三方设备ID' name='rawDeviceId'>
              {
                modalVisible.value &&
                  <Input
                    style={{ width: '480px' }}
                    v-model:value={formState.rawDeviceId} placeholder='请输入三方设备ID'
                    allowClear
                    maxlength={100}
                  />
              }
            </FormItem>
            <FormItem label='三方物联配置' name='config'>
              {
                modalVisible.value &&
                  <Textarea
                    style={{ width: '480px' }}
                    v-model:value={formState.config} placeholder='请输入三方物联配置'
                    allowClear
                  />
              }
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
