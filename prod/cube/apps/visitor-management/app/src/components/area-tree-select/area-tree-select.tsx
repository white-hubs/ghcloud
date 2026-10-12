import { TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { cubeVisitorManagementService } from '@/api/service'

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
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const areaOptions = ref([])
    cubeVisitorManagementService.getVisitorArea().then(res => {
      areaOptions.value = res.map(r => {
        return {
          id: r?.id + '',
          name: r?.name,
          children: []
        }
      }) as never[]
    })

    watch(() => props.value, () => {
      select.value = props.value ?? (props.cheakable ? [] : '')
    })
    const getArea = (value: string[]): { name: string; } => {
      const cur: { name: string; } = areaOptions.value.filter((a: { id: string[]; }) => a.id === value)[0]
      return { name: cur.name ?? '' }
    }
    return (): JSX.Element =>
      <TreeSelect
        fieldNames={{ label: 'name', value: 'id', children: 'children' }}
        placeholder={props.placeholder ?? '请选择'}
        treeData={areaOptions.value}
        allow-clear
        tree-checkable={props.cheakable}
        multiple={props.multiple ?? false}
        v-model:value={select.value}
        onChange={(val: string[]) => {
          emit('update:value', val)
          emit('change', getArea(val))
        }}
        disabled={props.readonly}
      />
  }
})
