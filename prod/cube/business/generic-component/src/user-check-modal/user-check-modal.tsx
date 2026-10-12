import { Input, PopOver, TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { ModalTable } from '../modal-table/modal-table'

import { deptList, getUserPage } from '../api/ouaa'

interface Props {
  title: string;
  multiple: boolean;
  visible: boolean;
  value: Record<string, string>[];
  loading: boolean;
}

export const UserCheckModal = defineComponent({
  props: ['title', 'multiple', 'value', 'visible', 'loading'],
  emits: ['ok', 'update:visible'],
  setup (props: Props, { emit }) {
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
        title: '名称',
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '部门',
        dataIndex: 'organizations',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; }[]; }) => {
          const data = text?.map((item) => item.name)
          if (data.length) {
            return (
              <PopOver content={data.join('/')}>{data.join('/')}</PopOver>
            )
          } else {
            return '--'
          }
        },
      },
      {
        title: '职位',
        dataIndex: 'positions',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; }[]; }) => {
          const data = text?.map((item) => item.name)
          if (data.length) {
            return (
              <PopOver content={data.join('/')}>{data.join('/')}</PopOver>
            )
          } else {
            return '--'
          }
        },
      },
      {
        title: '角色',
        dataIndex: 'roles',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; }[]; }) => {
          const data = text?.map((item) => item.name)
          if (data.length) {
            return (
              <PopOver content={data.join('、')}>{data.join('、')}</PopOver>
            )
          } else {
            return '--'
          }
        },
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

    const selectModelValue = ref<string[]>([])
    const selectValue = ref<Record<string, string>[]>([])
    const ok = (values: Record<string, string>[]): void => {
      selectValue.value = values
      selectModelValue.value = values.map(e => { return e.id })
      emit('ok', selectValue.value)
    }

    const unWatch = ref(false)

    watch(() => selectModelValue.value, () => {
      if (unWatch.value) {
        return
      }
      const res = selectValue.value.filter(e => selectModelValue.value.find(ele => e.id === ele))
      selectValue.value = res
    }, { deep: true })

    watch(() => props.value, () => {
      unWatch.value = true
      selectModelValue.value = (props.value ?? []).map(e => { return e.id })
      setTimeout(() => {
        unWatch.value = false
      }, 0)
    }, { deep: true })
    onMounted(() => {
      if (props.value?.length) {
        selectModelValue.value = props.value.map(e => { return e.id })
        selectValue.value = props.value
      }
      deptList().then(res => {
        search.value[0].componentProps.treeData = res.data as never[]
      })
    })
    const handleCancel = (): void => {
      emit('update:visible', false)
    }
    return () =>
      <ModalTable
        v-model:show={props.visible}
        columns={columns}
        title={props.title ?? '选择人员'}
        search={search.value}
        multiple={props.multiple}
        apiFunction={getUserPage}
        loading={props.loading}
        onCancel={handleCancel}
        onOk={ok}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
      />
  }
})
