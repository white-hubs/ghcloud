import { Form, FormItem, type FormExpose, Select, Button, message } from '@ghcloud/cube-ui'
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { DeviceModalTable } from '../device-modal-table/device-modal-table'
import { GlobalSelect } from '@ghcloud/generic-component'
import { cubeDeviceCenterService } from '@/api/service'

/** 关联设备 form 组件 */
interface Props {
  value: {
    productId?: string | string[] | undefined;
    deviceList?: { deviceName: string; deviceId: string; }[];
  };
  readonly: boolean;
  placeholder?: string;
  disRequired?: boolean;
}
export const DeviceFormItem = defineComponent({
  props: ['value', 'readonly', 'placeholder', 'disRequired'],
  emits: ['update:value', 'productChange'],
  setup (props: Props, { emit, expose }) {
    const formRef = ref<FormExpose>()
    const formState = reactive<{
      deviceIds: string[];
      productId: string | string[] | undefined;
    }>({
      deviceIds: [],
      productId: undefined,
    })

    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ deviceName: string; deviceId: string; }[]>([])

    watch(() => props.value, (newValue) => {
      if (newValue.deviceList) {
        formState.deviceIds = newValue.deviceList.map(e => {
          return e.deviceId
        })
        formState.productId = newValue.productId
        deviceList.value = newValue.deviceList
      } else {
        formState.deviceIds = []
        formState.productId = undefined
        deviceList.value = []
      }
    }, { immediate: true, deep: true })
    const checkDeviceList = async (): Promise<void> => {
      if (!formState.deviceIds || formState.deviceIds.length === 0) {
        return Promise.reject(new Error('请选择手术室设备'))
      }
      return Promise.resolve()
    }
    const formRules = computed(() => {
      if (props.disRequired) {
        return {
          deviceList: []
        }
      } else {
        return {
          deviceList: [{ validator: checkDeviceList }],
        }
      }
    })

    const validateForm = async (): Promise<unknown> => {
      try {
        await formRef.value?.validate()
        emit('update:value', {
          productId: formState.productId,
          deviceList: deviceList.value
        })
        return formState
      } catch {
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
    watch(() => formState.productId, () => {
      deviceList.value = []
      emit('productChange', formState.productId)
      emit('update:value', {
        productId: formState.productId,
        deviceList: deviceList.value
      })
    })
    expose({
      validateForm,
      resetForm,
    })

    return (): JSX.Element =>
      <>
        <Form
          ref={formRef} model={formState}
          rules={formRules}
          layout='inline'
        >
          <FormItem label='' name='productId' style={{ paddingRight: '0', marginRight: '10px' }}>
            <GlobalSelect
              placeholder='请选择所属产品'
              field-names={{ label: 'prodName', value: 'id' }}
              v-model:value={formState.productId}
              apiFunction={async () => cubeDeviceCenterService.getProductListAll()}
              style={{ minWidth: '160px' }}
              show-search
              optionFilterProp='prodName'
              onChange={() => {
                emit('productChange', formState.productId)
                deviceList.value = []
                emit('update:value', {
                  productId: formState.productId,
                  deviceList: deviceList.value
                })
              }}
            />
          </FormItem>
          <FormItem name='deviceList' style={{ paddingRight: '0', marginRight: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select
                style={{ minWidth: '200px' }}
                open={false}
                showArrow={false}
                mode='multiple'
                options={deviceList.value}
                v-model:value={formState.deviceIds}
                placeholder={props.placeholder || '请选择手术室设备'}
                fieldNames={{ label: 'deviceName', value: 'deviceId' }}
                getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                maxTagCount={5}
                onChange={() => {
                  deviceList.value = deviceList.value.filter(e => {
                    return formState.deviceIds.includes(e.deviceId)
                  })
                  emit('update:value', {
                    productId: formState.productId,
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
          searchParams={{ applicationCode: 'OPERATING_ROOM', productId: formState.productId }}
          // searchParams={{ applicationCode: 'OPERATING_ROOM' }}
          v-model:value={deviceList.value}
          onOk={(values: { deviceName: string; deviceId: string; }[]) => {
            formState.deviceIds = values.map(e => {
              return e.deviceId
            })
            deviceList.value = values.map(e => {
              return { deviceName: e.deviceName, deviceId: e.deviceId }
            })
            emit('update:value', {
              productId: formState.productId,
              deviceList: deviceList.value
            })
          }}
        />
      </>
  }
})
