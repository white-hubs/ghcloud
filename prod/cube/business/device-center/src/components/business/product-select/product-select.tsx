import { cubeDeviceCenterService } from '@/api/service'
import type { ProductState } from '@ghcloud/cube-iot-center-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 产品选择器 */
export const ProductSelect = defineComponent({
  props: ['value', 'width'],
  emits: ['update:value', 'change'],
  setup: (props: { value: string; width: string; }, { emit }) => {
    const options = ref<ProductState[]>([])
    cubeDeviceCenterService.getProductListAll().then(res => {
      options.value = res
    })

    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择产品'
          field-names={{ label: 'prodName', value: 'id' }} style={{ width: props.width || '180px' }}
          onChange={(e: string) => {
            emit('update:value', e)
            const selectValue = options.value.find(ele => e === ele.id)
            emit('change', selectValue)
          }}
          allowClear
          showSearch
          optionFilterProp='prodName'
        />
      </>
  }
})
