import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import type { AreaTree } from '@ghcloud/cube-ouaa-service'
import { cubeMdataService } from '../../api/service'

interface Props {
  multiple: boolean;
  value: string;
  placeholder: string;
  readonly: boolean;
}

/** 区域选择 */
export const AreaCascaderSelect = defineComponent({
  props: ['multiple', 'value', 'placeholder', 'readonly'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const areaOptions = ref([])
    cubeMdataService.getAreaTree().then(res => {
      areaOptions.value = res as never[]
    })

    watch(() => props.value, () => {
      select.value = props.value ?? ''
    })
    return (): JSX.Element =>
      <Cascader
        fieldNames={ { label: 'name', value: 'id', children: 'children' } }
        placeholder={props.placeholder ?? '请选择'}
        allow-clear
        multiple={props.multiple ?? false}
        options={areaOptions.value}
        v-model:value={select.value}
        onChange={(val: string[], selectedOptions: AreaTree[]) => {
          emit('update:value', val)
          emit('change', selectedOptions)
        }}
        disabled={props.readonly}
        changeOnSelect
        allowClear
        showSearch
        optionFilterProp='name'
      />
  }
})
