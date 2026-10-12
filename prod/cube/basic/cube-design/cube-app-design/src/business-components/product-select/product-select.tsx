import { cubeDeviceCenterService } from '../../api/service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

interface Props {
  multiple: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
}

/** 产品选择器 */
export const ProductSelect = defineComponent({
  props: ['value', 'multiple', 'placeholder', 'readonly'],
  emits: ['update:value'],
  setup: (props: Props, { emit, attrs }) => {
    const options = ref<{ label: string; value: string; }[]>([])
    cubeDeviceCenterService.getProductListAll().then(res => {
      options.value = res.map(e=>{
        return {
          value: e.id ?? '',
          label: e.prodName ?? '未知'
        }
      })
    })

    return (): JSX.Element=>
      <>
        <Select
          {...attrs}
          value={props.value}
          options={options.value}
          placeholder={props.placeholder ?? '请选择产品'}
          mode={props.multiple ? 'multiple' : undefined}
          onChange={(e: string) => {
            emit('update:value', e)
          }}
          allowClear
          showSearch
          disabled={props.readonly}
          optionFilterProp='label'
        />
      </>
  }
})
