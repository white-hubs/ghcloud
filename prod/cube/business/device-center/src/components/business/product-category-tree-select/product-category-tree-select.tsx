import { cubeDeviceCenterService } from '@/api/service'
import type { ProductCategoryTree, ProductIotCategoryTree } from '@ghcloud/cube-iot-center-service'
import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 产品品类级联选择器 */
export const ProductCategoryTreeSelect = defineComponent({
  props: ['value', 'useType'],
  emits: ['update:value'],
  setup: (props: { value: string;useType: 'id' | 'code'; }, { emit }) => {
    const options = ref<ProductCategoryTree[] | ProductIotCategoryTree[]>([])
    const useType = props.useType ?? 'id'
    if (useType === 'id') {
      cubeDeviceCenterService.getProductCategoryTree().then(res => {
        options.value = res
      })
    } else {
      cubeDeviceCenterService.getIotProductCategoryTree().then(res => {
        options.value = res
      })
    }
    const fieldNames = useType === 'id' ? { label: 'itemLabel', value: 'id', children: 'children' } : { label: 'categoryName', value: 'categoryCode', children: 'children' }

    return (): JSX.Element =>
      <Cascader
        placeholder='请选择产品品类'
        field-names={fieldNames}
        options={options.value}
        style='width:180px'
        value={props.value}
        changeOnSelect
        onChange={(e: string[]) => {
          emit('update:value', e)
        }}
        allowClear
        showSearch
        optionFilterProp={useType === 'id' ? 'itemLabel' : 'categoryName'}
      />
  }
})
