import { TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { deptList } from '../api/ouaa'

interface Props {
  title: string;
  multiple: boolean;
  cheakable: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
  showSearch: boolean;
  treeNodeFilterProp: string;
  treeNodeLabelProp: string;
  deleteAll:boolean;
}

export const DeptTreeSelect = defineComponent({
  props: ['title', 'multiple', 'value', 'cheakable', 'placeholder', 'readonly', 'showSearch', 'treeNodeFilterProp', 'treeNodeLabelProp','deleteAll'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const treeData = ref([])
    const select = ref(props.value)
    deptList().then(res => {
      if(!props.deleteAll){
        res.data.unshift({
        "id": "",
        "parentId": "",
        "level": 2,
        "children": [],
        "name": "全部",
        "remark": "",
        "members": null,
        "enabled": true,
        "sequence": ""
      })
      }
      
      treeData.value = res.data as never[]
    })

    watch(() => props.value, () => {
      select.value = props.value ?? (props.cheakable ? [] : '')
    })
    return () =>
      <TreeSelect
        {...props}
        fieldNames={ { label: 'name', value: 'id', children: 'children' } }
        placeholder={props.placeholder ?? '请选择'}
        treeData={treeData}
        allow-clear
        tree-checkable={props.cheakable}
        multiple={props.multiple ?? false}
        v-model:value={select.value}
        onChange={(val: string[]) => { emit('update:value', val) }}
        disabled={props.readonly}
      />
  }
})
