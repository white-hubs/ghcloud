import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'

interface Props {
  multiple: boolean;
  value: string;
  placeholder: string;
  readonly: boolean;
}

/** 区域选择 */
export const AreaCascaderSelect = defineComponent({
  props: ['multiple', 'value', 'placeholder', 'readonly'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const areaOptions = ref(localStorage.getItem('operating-room-area-tree') ? JSON.parse(localStorage.getItem('operating-room-area-tree') ?? '') : [])
    areaOptions.value = window.businessData?.areaData ?? []
    localStorage.setItem('operating-room-area-tree', JSON.stringify(areaOptions.value))
    watch(() => props.value, () => {
      select.value = props.value ?? ''
    })
    return (): JSX.Element =>
      <Cascader
        fieldNames={{ label: 'name', value: 'id', children: 'children' }}
        placeholder={props.placeholder ?? '请选择'}
        allow-clear
        multiple={props.multiple ?? false}
        options={areaOptions.value}
        v-model:value={select.value}
        onChange={(val: string[]) => {
          emit('update:value', val)
        }}
        disabled={props.readonly}
        changeOnSelect
      />
  }
})
