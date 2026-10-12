import { TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { getAreaList } from '../api/mdata'

interface Props {
  title: string;
  multiple: boolean;
  cheakable: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
}
/** 区域选择 */
export const AreaTreeSelect = defineComponent({
  props: ['title', 'multiple', 'value', 'cheakable', 'placeholder', 'readonly'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const areaOptions = ref([])
    getAreaList().then(res => {
      areaOptions.value = res.data as never[]
    })

    watch(() => props.value, () => {
      select.value = props.value ?? (props.cheakable ? [] : '')
    })
    return () =>
      <TreeSelect
        fieldNames={ { label: 'name', value: 'id', children: 'children' } }
        placeholder={props.placeholder ?? '请选择'}
        treeData={areaOptions.value}
        allow-clear
        tree-checkable={props.cheakable}
        multiple={props.multiple ?? false}
        v-model:value={select.value}
        onChange={(val: string[]) => { emit('update:value', val) }}
        disabled={props.readonly}
      />
  }
})
