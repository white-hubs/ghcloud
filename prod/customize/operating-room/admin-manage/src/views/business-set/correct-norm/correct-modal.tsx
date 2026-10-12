import { cubeDictionaryService } from '@/api/service'
import { Form, FormItem, InputNumber, Modal, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive } from 'vue'
import { debounce } from 'lodash'
import type { ProductState } from '@ghcloud/cube-iot-center-service'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import dayjs from 'dayjs'
import { DeviceFormItem } from '@/components/business/device-form-item/device-form-item'
import { NormSelect } from '@/components/business/norm-select/norm-select'
import { CorrectState, type CorrectNorm, type PropNorm } from '@/types/correct-norm-type'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'

interface Props {
  labelWidth: string;
  tenant: string;
}
export const CorrectModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
    tenant: {
      type: String,
      default: ''
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref(false)
    const formRenderRef = ref()
    const formState = reactive<CorrectNorm>({
      tenant: props.tenant ?? '',
      tenantName: undefined,
      productId: undefined,
      productName: undefined,
      normCode: undefined,
      normName: '',
      unit: undefined,
      correctValue: undefined,
      device: {
        productId: undefined,
        productName: undefined,
        deviceList: [],
        department: undefined
      },
      handleTime: undefined,
      handleUser: undefined,
      deptId: undefined,
      deptName: undefined,
      state: CorrectState.VAILD
    })
    const tenantChange = (tenant: { label: string; value: string; }): void => {
      formState.tenantName = tenant.label ?? ''
    }
    const handleProductChange = (product: ProductState): void => {
      formState.productId = product.id
      formState.productName = product.prodName
    }
    const handleNormChange = (norm: PropNorm): void => {
      formState.normName = norm.name
      formState.unit = norm.unit
    }
    const modalRules = {
      tenant: [{ required: true, message: '请选择所属医院', trigger: 'blur' }],
      device: [{ required: true, message: '请选择手术室', trigger: 'blur' }],
      normCode: [{ required: true, message: '请选择指标', trigger: 'blur' }],
      correctValue: [{ required: true, message: '输入修正值', trigger: 'blur' }],
    }
    const handleOk = debounce(async () => {
      await formRenderRef.value.validate()
      try {
        submitLoading.value = true
        const userInfo = sessionStorage.getItem('userInfo')
        const variable = JSON.stringify({
          ...formState,
          tenantName: formState.tenantName,
          handleTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          handleUser: typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo,
        })
        await cubeDictionaryService.addDataDictionary({
          itemCode: OperateRoomDictionaryKey.OPERATING_ROOM_ADMIN_CORRECT_NORM_SET,
          name: '修正指标设置',
          variable,
          tenant: formState.tenant
        })
        message.success('操作成功')
        modalVisible.value = false
        emit('enter')
      } catch {
      } finally {
        submitLoading.value = false
      }
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      emit('enter')
      formRenderRef.value?.resetFields()
    }
    const resetForm = (): void => {
      Object.assign(formState, {
        tenant: props.tenant ?? '',
        tenantName: undefined,
        productId: undefined,
        productName: undefined,
        normCode: undefined,
        normName: '',
        unit: undefined,
        correctValue: undefined,
        device: {
          productId: undefined,
          productName: undefined,
          deviceList: [],
          department: undefined
        },
        handleTime: undefined,
        handleUser: undefined,
        deptId: undefined,
        deptName: undefined,
        state: CorrectState.VAILD
      })
    }
    const openModal = (): void => {
      modalVisible.value = true
      formRenderRef.value?.resetFields()
      resetForm()
    }

    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='修正指标'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='800px'
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='所属医院' name='tenant'>
              <TenantSelect v-model:value={formState.tenant} onChange={tenantChange} width='450px' />
            </FormItem>
            <FormItem label='选择手术室' name='device'>
              <DeviceFormItem tenant={formState.tenant} v-model:value={formState.device} onProductChange={handleProductChange} />
            </FormItem>
            <FormItem label='选择指标' name='normCode'>
              <NormSelect prodId={formState.productId} filterSpecial={formState} hideAirconditioner v-model:value={formState.normCode} onChange={handleNormChange} width='450px' />
            </FormItem>
            <FormItem label='修正值' name='correctValue' style={{ width: '570px' }}>
              <InputNumber v-model:value={formState.correctValue} min={-999999999.99999} precision={10} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
