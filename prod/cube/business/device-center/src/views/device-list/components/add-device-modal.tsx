import { cubeDeviceCenterInternalService } from '@/api/service'
import { ProductSelect } from '@/components/business/product-select/product-select'
import { debounce } from '@/utils/tool'
import { Form, FormItem, Input, Modal, Textarea, message } from '@ghcloud/cube-ui'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { defineComponent, ref, reactive, computed } from 'vue'
import { RelateSubDevice } from './relate-sub-device'

interface Props {
  labelWidth: string;
}

export const AddDeviceModel = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '90px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const formRenderRef = ref()
    const formState = reactive< {
      productId: string | undefined;
      parentDeviceId: string | null;
      deviceNumber: string;
      deviceName: string;
      deviceType: number;
      remark: string;
      nodeType: number | undefined;
      nodeTypeName: string | undefined;
      relationDeviceIds: { id: string; name: string; }[] | undefined;
    }>({
      productId: undefined,
      parentDeviceId: null,
      deviceNumber: '',
      deviceName: '',
      deviceType: 1, // 设备类型 1真实设备; 0虚拟设备
      remark: '',
      nodeType: undefined,
      nodeTypeName: undefined,
      relationDeviceIds: undefined
    })
    const isSubDevice = computed(() => {
      return formState.nodeTypeName === '网关子设备' || formState.nodeType === 3
    })
    const modalRules = {
      productId: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
      deviceNumber: [{ required: true, message: '请输入设备序列号', trigger: 'blur' }],
      deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    }
    const modalRulesTwo = {
      productId: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
      parentDeviceId: [{ required: true, message: '请选择父级设备', trigger: 'blur' }],
      deviceNumber: [{ required: true, message: '请输入设备序列号', trigger: 'blur' }],
      deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    }
    const handleOk = debounce(() => {

      formRenderRef.value.validate().then(async () => {
        submitLoading.value = true
        const params = {
          ...formState,
          relationDeviceIds: formState.relationDeviceIds?.map(e => e.id).join(',') ?? '',
        }
        if (!isSubDevice.value) params.parentDeviceId = null
        try {
          await cubeDeviceCenterInternalService.addDevice(params)
          message.success('操作成功')
          modalVisible.value = false
        } catch {
        } finally {
          submitLoading.value = false
        }
        emit('enter')
      }).catch(() => {
      })
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')

      formRenderRef.value?.resetFields()
    }
    const parentDeviceOption = ref<unknown[]>()
    const openModal = (): void => {
      modalVisible.value = true

      formRenderRef.value?.resetFields()
      cubeDeviceCenterInternalService.getDeviceGateway().then((res: unknown[]) => {
        parentDeviceOption.value = res
      })
    }

    expose({
      openModal
    })
    return (): JSX.Element=>
      <>
        <Modal
          visible={modalVisible.value}
          title='新增设备'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
        >
          <Form model={formState} ref={formRenderRef} rules={isSubDevice.value ? modalRulesTwo : modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='所属产品' name='productId'>
              <ProductSelect
                width='480px' v-model:value={formState.productId} onChange={(e: { nodeType: number;nodeTypeName: string; }) => {
                  formState.nodeType = e.nodeType
                  formState.nodeTypeName = e.nodeTypeName
                }}
              />
            </FormItem>
            <FormItem label='节点类型' name='nodeTypeName'>
              <span>{formState.nodeTypeName || '--'}</span>
            </FormItem>
            {
              isSubDevice.value &&
                <>
                  <FormItem label='父级设备' name='parentDeviceId'>
                    <Select
                      style={{ width: '480px' }}
                      v-model:value={formState.parentDeviceId}
                      options={parentDeviceOption.value}
                      placeholder='请选择父级设备'
                      field-names={{ label: 'name', value: 'id' }}
                      allowClear
                    />
                  </FormItem>
                </>
            }
            <FormItem label='设备序列号' name='deviceNumber'>
              <Input
                maxlength={30}
                style={{ width: '480px' }}
                v-model:value={formState.deviceNumber} placeholder='请输入设备序列号'
                allowClear
              />
            </FormItem>
            <FormItem label='设备名称' name='deviceName'>
              <Input
                maxlength={30}
                style={{ width: '480px' }}
                v-model:value={formState.deviceName} placeholder='请输入设备名称'
                allowClear
              />
            </FormItem>
            <FormItem label='关联子设备' name='relationDeviceIds'>
              <RelateSubDevice v-model:value={formState.relationDeviceIds} />
            </FormItem>
            <FormItem label='设备描述' name='remark'>
              <Textarea
                style={{ width: '480px' }}
                v-model:value={formState.remark} placeholder='请输入设备描述'
                allowClear
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
