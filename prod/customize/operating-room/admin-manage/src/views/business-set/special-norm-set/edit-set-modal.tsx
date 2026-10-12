import { cubeDictionaryService } from '@/api/service'
import { Form, FormItem, InputNumber, Modal, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, watch } from 'vue'
import { debounce } from 'lodash'
import type { ProductState } from '@ghcloud/cube-iot-center-service'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import dayjs from 'dayjs'
import { ProductSelect } from '@/components/business/product-select/product-select'
import { NormSelect } from '@/components/business/norm-select/norm-select'
import type { PropNorm, SpecialNorm } from '@/types/special-norm-type'
import style from '@/assets/style.module.less'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'

interface Props {
  labelWidth: string;
  id: string;
  tenant: string;
}
export const EditSetModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '80px'
    },
    id: {
      type: String,
      default: ''
    },
    tenant: {
      type: String,
      default: ''
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)

    const formRef = ref()
    const formState = reactive<SpecialNorm>({
      tenant: props.tenant ?? '',
      tenantName: undefined,
      productId: undefined,
      productName: undefined,
      normCode: undefined,
      normName: '',
      unit: undefined,
      upperLimit: undefined,
      lowerLimit: undefined,
      upperLimitError: undefined,
      lowerLimitError: undefined,
      handleTime: undefined,
    })
    const dictionaryInfo = ref()
    const tenantChange = (tenant: { label: string; value: string; }): void => {
      formState.tenantName = tenant.label
    }
    const productChange = async (product: ProductState): Promise<void> => {
      formState.productName = product.prodName
    }
    const handleNormChange = (norm: PropNorm): void => {
      formState.normName = norm.name
      formState.unit = norm.unit
    }
    const checkLimit = async (): Promise<void> => {
      if (
        formState?.lowerLimit !== undefined &&
        formState?.upperLimit !== undefined &&
        formState?.upperLimit <= formState?.lowerLimit) {
        return Promise.reject(new Error('上限不能小于等于小限'))
      }
      return Promise.resolve()
    }
    const modalRules = {
      productId: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
      normCode: [{ required: true, message: '请选择指标', trigger: 'blur' }],
      lowerLimit: [{ required: false, validator: checkLimit, trigger: 'change' }],
    }
    const handleOk = debounce(async () => {
      await formRef.value.validate()
      try {
        submitLoading.value = true
        const variable = JSON.stringify({
          ...formState,
          tenantName: formState.tenantName,
          handleTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
        await cubeDictionaryService.updateDataDictionary({
          id: props.id,
          itemCode: OperateRoomDictionaryKey.OPERATING_ROOM_ADMIN_SPECIAL_NORM_SET,
          name: '特殊指标设置',
          variable,
          code: dictionaryInfo.value.code,
          remarks: dictionaryInfo.value.remarks,
          version: dictionaryInfo.value.version,
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
      formRef.value?.resetFields()
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
        upperLimit: undefined,
        lowerLimit: undefined,
        upperLimitError: undefined,
        lowerLimitError: undefined,
        handleTime: undefined,
      })
    }

    const getDictionaryInfo = async (): Promise<void> => {
      dictionaryInfo.value = await cubeDictionaryService.getDataDictionaryById({ id: props.id })
    }
    watch(() => props.id, async () => {
      if (props.id) await getDictionaryInfo()
    }, { immediate: true })
    const openModal = async (row?: SpecialNorm & { id: string; }): Promise<void> => {
      resetForm()
      if (props.id || row?.id) {
        Object.assign(formState, row)
      }
      modalVisible.value = true
    }

    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='编辑特殊指标'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='800px'
        >
          <Form model={formState} ref={formRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='所属医院' name='tenant'>
              <TenantSelect v-model:value={formState.tenant} onChange={tenantChange} width='300px' />
            </FormItem>
            <FormItem label='所属产品' name='productId'>
              <ProductSelect tenant={formState.tenant} v-model:value={formState.productId} onChange={productChange} width='300px' />
            </FormItem>
            <FormItem label='选择指标' name='normCode'>
              <NormSelect prodId={formState.productId} hideAirconditioner v-model:value={formState.normCode} onChange={handleNormChange} width='300px' />
            </FormItem>
            <FormItem label='正常范围' name='lowerLimit'>
              <div class={style['norm-rule']}>
                <InputNumber style={{ width: '80px' }} placeholder='请输入下限' v-model:value={formState.lowerLimit} min={-9999999999.99999} max={9999999999.99999} precision={8} />
                <span class={style['m-10']}>到</span>
                <InputNumber style={{ width: '80px' }} placeholder='请输入上限' v-model:value={formState.upperLimit} min={-9999999999.99999} max={9999999999.99999} precision={8} />
              </div>
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
