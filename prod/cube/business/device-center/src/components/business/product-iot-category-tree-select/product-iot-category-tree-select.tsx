import { cubeDeviceCenterService } from '@/api/service'
import type { ProductIotCategoryTree } from '@ghcloud/cube-iot-center-service'
import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 产品品类级联选择器 */
export const ProductIotCategoryTreeSelect = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup: (props: { value: string; }, { emit }) => {
    const options = ref<ProductIotCategoryTree[]>([])
    cubeDeviceCenterService.getIotProductCategoryTree().then(res => {
      options.value = res
    })

    return (): JSX.Element =>
      <Cascader
        placeholder='请选择产品品类'
        field-names={{ label: 'categoryName', value: 'categoryCode', children: 'children' }}
        options={options.value}
        style='width:180px'
        value={props.value}
        changeOnSelect
        onChange={(e: string[]) => {
          emit('update:value', e)
        }}
        allowClear
        showSearch
        optionFilterProp='categoryName'
      />
  }
})
