import { Input, PopOver, TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { ModalTable } from '../modal-table/modal-table'

import { getRole } from '../api/ouaa'
interface Props {
  title: string;
  multiple: boolean;
  value: { id: string; name: string; }[];
}
export const RoleCheckModal = defineComponent({
  props: ['title', 'multiple', 'value'],
  emits: ['update:value', 'ok'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }

    const search = ref(
      [
        { label: '部门', key: 'organizationId', component: TreeSelect, componentProps: { placeholder: '请选择', treeData: [], fieldNames: { label: 'name', value: 'id', children: 'children' }, style: { width: '180px' } } },
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '请输入姓名' } }
      ]
    )
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }) => `${index + 1}`
      },
      {
        title: '角色',
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: boolean; }) => {
          const res = text ? '启用' : '禁用'
          return <PopOver content={res}>{res}</PopOver>
        }
      }
    ]

    const selectModelValue = ref<string[]>((props.value ?? []).map(e => { return e.id }))
    const selectValue = ref<{ id: string; name: string; }[]>(props.value ?? [])
    const ok = (values: { id: string; name: string; }[]): void => {
      selectValue.value = values
      selectModelValue.value = values.map(e => { return e.id })
      modalVisible.value = false
    }

    const unWatch = ref(false)

    // 内部往外面传
    watch(() => selectModelValue.value, (n, o) => {
      if (unWatch.value) {
        return
      }
      unWatch.value = true
      const res = selectValue.value.filter(e => selectModelValue.value.find(ele => e.id === ele))
      selectValue.value = res
      emit('update:value', res)
      emit('ok', res)
      setTimeout(() => {
        unWatch.value = false
      }, 0)
    }, { deep: true })

    // 外部往里面传
    watch(() => props.value, () => {
      if (unWatch.value) {
        return
      }
      unWatch.value = true
      selectModelValue.value = (props.value ?? []).map(e => { return e.id })
      selectValue.value = props.value
      setTimeout(() => {
        unWatch.value = false
      }, 0)
    }, { deep: true })

    expose({
      openModal
    })

    return () =>
      <ModalTable
        v-model:show={modalVisible.value}
        columns={columns}
        title={props.title ?? '选择角色'}
        search={search.value}
        multiple={props.multiple}
        apiFunction={getRole}
        onOk={ok}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
      />
  }
})
