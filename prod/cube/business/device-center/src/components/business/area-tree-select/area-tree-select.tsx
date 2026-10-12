import { cubeMdataService } from '@/api/service'
import type { AreaTree } from '@ghcloud/cube-mdata-service'
import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 区域级联选择器 */
export const AreaTreeSelect = defineComponent({
  props: ['value', 'width'],
  emits: ['update:value'],
  setup: (props: { value: string; width: string; }, { emit }) => {
    const options = ref<AreaTree[]>([])
    cubeMdataService.getAreaTree().then(res => {
      options.value = res
    })

    return (): JSX.Element=>
      <>
        <Cascader
          placeholder='请选择所在区域'
          field-names={{ label: 'name', value: 'id', children: 'children' }}
          options={options.value}
          style={{ width: props.width || '180px' }}
          value={props.value}
          changeOnSelect
          onChange={(e: string[]) => {
            emit('update:value', e)
          }}
          allowClear
          showSearch
          optionFilterProp='name'
        />
      </>
  }
})
