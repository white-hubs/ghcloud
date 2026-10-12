import { Form, FormItem, type FormExpose, type RuleObject, Select, Button, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref, watch } from 'vue'
import { DeviceModalTable } from '../device-modal-table/device-modal-table'
import { cubeDeviceCenterService } from '@/api/service'
import type { ProductState } from '@ghcloud/cube-iot-center-service'
import { ProductSelect } from '../product-select/product-select'

/** 关联设备 form 组件 */
interface Props {
  value: {
    productId?: string | undefined;
    deviceList?: { name: string; id: string; }[];
    department?: { id: string;name: string; }[] | undefined;
  };
  readonly: boolean;
  tenant: string | undefined;
}
export const DeviceFormItem = defineComponent({
  props: ['value', 'readonly', 'tenant'],
  emits: ['update:value', 'productChange', 'deviceChange'],
  setup (props: Props, { emit, expose }) {
    const formRef = ref<FormExpose>()
    const formState = reactive<{
      deviceIds: string[];
      productId: string | undefined;
      productName: string | undefined;
      department: { id: string;name: string; }[] | undefined;
    }>({
      deviceIds: [],
      productId: undefined,
      productName: undefined,
      department: undefined,
    })

    const productOptions = ref<ProductState[]>([])
    const getProductData = async (): Promise<void> => {
      const result = await cubeDeviceCenterService.getProductListAll(props.tenant)
      productOptions.value = result
    }
    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ name: string; id: string; }[]>([])

    watch(() => props.value, (newValue) => {
      if (newValue.deviceList) {
        formState.deviceIds = newValue.deviceList.map(e => {
          return e.id
        })
        formState.productId = newValue.productId
        formState.department = newValue.department
        deviceList.value = newValue.deviceList
      }
    }, { immediate: true, deep: true })
    const checkDeviceList = async (): Promise<void> => {
      if (!formState.deviceIds || formState.deviceIds.length === 0) {
        return Promise.reject(new Error('请选择手术室设备'))
      }
      return Promise.resolve()
    }
    const formRules: Record<string, RuleObject[]> = {
      deviceList: [{ validator: checkDeviceList }],
    }

    const validateForm = async (): Promise<unknown> => {
      try {
        await formRef.value?.validate()
        emit('update:value', {
          productId: formState.productId,
          department: formState.department,
          deviceList: deviceList.value
        })
        return formState
      } catch {
        return formState
      }
    }
    const resetForm = async (): Promise<void> => {
      try {
        formRef.value?.resetFields()
      } catch {
      }
    }
    const selectDevice = async (): Promise<void> => {
      if (!formState.productId) {
        message.warn('请选择所属产品')
      } else {
        deviceModalTableRef.value?.openModal()
      }
    }
    watch(() => props.tenant, () => {
      getProductData()
    }, { immediate: true })
    expose({
      validateForm,
      resetForm,
    })

    return (): JSX.Element =>
      <>
        <Form
          ref={formRef}
          model={formState}
          rules={formRules}
          layout='inline'
        >
          <FormItem label='' name='productId' style={{ paddingRight: '0', marginRight: '10px' }}>
            <ProductSelect
              tenant={props.tenant}
              v-model:value={formState.productId}
              onChange={(product: ProductState) => {
                deviceList.value = []
                formState.productName = product.prodName
                emit('productChange', product)
                emit('update:value', {
                  productId: product.id,
                  productName: product.prodName,
                  department: formState.department,
                  deviceList: deviceList.value
                })
              }}
              width='160px'
            />
          </FormItem>
          <FormItem name='deviceList'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select
                style={{ minWidth: '200px' }}
                open={false}
                showArrow={false}
                mode='multiple'
                options={deviceList.value}
                v-model:value={formState.deviceIds}
                placeholder='请选择手术室设备'
                fieldNames={{ label: 'name', value: 'id' }}
                getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                maxTagCount={2}
                onChange={() => {
                  deviceList.value = deviceList.value.filter(i => formState.deviceIds?.includes(i.id))
                  emit('update:value', {
                    productId: formState.productId,
                    productName: formState.productName,
                    department: formState.department,
                    deviceList: deviceList.value
                  })
                }}
              />
              <Button type='primary' onClick={selectDevice}>选择设备</Button>
            </div>
          </FormItem>
        </Form>
        <DeviceModalTable
          ref={deviceModalTableRef}
          searchParams={{ applicationCode: __ENV__.applicationCode, tagCodes: [__ENV__.tagCodes], productId: formState.productId }}
          v-model:value={deviceList.value}
          tenant={props.tenant}
          onOk={(values: { name: string; id: string; department?: { id: string;name: string; }; }[]) => {
            formState.deviceIds = values.map(e => {
              return e.id
            })
            deviceList.value = values.map(e => {
              return { name: e.name, id: e.id }
            })
            emit('update:value', {
              productId: formState.productId,
              productName: formState.productName,
              deviceList: deviceList.value,
              department: values.map(v => v.department)
            })
          }}
        />
      </>
  }
})
