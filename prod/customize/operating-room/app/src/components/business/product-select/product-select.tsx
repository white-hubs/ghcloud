import { cubeDeviceCenterService } from '@/api/service'
import type { ProductState } from '@ghcloud/cube-iot-center-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
interface Props {
  value: string;
  tenant: string;
  width: string;
}
/** 所属产品 */
export const ProductSelect = defineComponent({
  props: ['value', 'tenant', 'width'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit }) => {
    const options = ref<ProductState[]>([])
    watch(() => props.tenant, (newValue) => {
      if (newValue) {
        cubeDeviceCenterService.getProductListAll(props.tenant).then(res => {
          options.value = res
        })
      } else {
        options.value = []
      }
    }, { immediate: true })
    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择所属产品'
          field-names={{ label: 'prodName', value: 'id' }}
          show-search
          optionFilterProp='prodName'
          onChange={(e: string) => {
            emit('update:value', e)
            const selectValue = options.value.find(ele => e === ele.id)
            emit('change', selectValue)
          }}
          allowClear
          style={{ width: props.width || '180px' }}
        />
      </>
  }
})
