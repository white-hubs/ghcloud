import { Checkbox, Input, PopOver, Select, TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { ModalTable } from '../modal-table/modal-table'
import { deptList, getAppointmentList, getPositionList, getRoleList, getUserPage } from '../api/ouaa'

interface Props {
  title: string;
  multiple: boolean;
  value: { id: string; name: string; }[];
}

export const UserPickerModal = defineComponent({
  props: ['title', 'multiple', 'value'],
  emits: ['update:value'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const search = ref(
      [
        { label: '部门', key: 'organizationId', component: TreeSelect, componentProps: { placeholder: '请选择部门', treeData: [], fieldNames: { label: 'name', value: 'id', children: 'children' }, style: { width: '180px' } } },
        { label: '职位', key: 'positionId', component: Select, componentProps: { options: [], fieldNames: { label: 'name', value: 'id' }, placeholder: '请选择职位', style: { width: '180px' } } },
        { label: '岗位', key: 'appointmentId', component: Select, componentProps: { options: [], fieldNames: { label: 'name', value: 'id' }, placeholder: '请选择岗位', style: { width: '180px' } } },
        { label: '角色', key: 'roleId', component: Select, componentProps: { options: [], fieldNames: { label: 'name', value: 'id' }, placeholder: '请选择角色', style: { width: '180px' } } },
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '请输入姓名' } },
        {
          label: '',
          key: 'checkAll',
          component: Checkbox,
          componentProps: {
            onChange: (e: Event) => { checkAllChange(e) }
          },
          slots: { default: () => '勾选所有' }
        }
      ]
    )
    const modalTableRef = ref<{ formState: Record<string, unknown>; pagination: Record<string, unknown>; state: Record<string, unknown>; getTableData: () => Promise<void>; }>()
    const checkAllChange = (e: Event): void => {
      const isAll = (e.target as unknown as { checked: boolean; }).checked
      handleTableAll(isAll)
    }
    const handleTableAll = async (isAll: boolean): Promise<void> => {
      try {
        const pageSize = 999
        const count = Math.ceil(Number(modalTableRef.value?.pagination?.total) / pageSize)
        let list: { id: string; name: string; }[] = []
        for (let i = 0; i < count; i++) {
          const params = {
            ...modalTableRef.value?.formState,
            pageNumber: i + 1,
            pageSize
          }
          const { data } = await getUserPage(params)
          if (data && data.records.length > 0) {
            list = [...list, ...(data.records as { id: string; name: string; }[])]
          }
        }
        if (modalTableRef.value) {
          if (isAll) {
            modalTableRef.value.state.selectedRowKeys = list.map(e => { return e.id })
            modalTableRef.value.state.selectedRows = list
          } else {
            modalTableRef.value.state.selectedRowKeys = []
            modalTableRef.value.state.selectedRows = []
          }
        }
      } catch (error) {
      }
    }

    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }) => <span>{(pagination.value.pageNumber - 1) * pagination.value.pageSize + index + 1}</span>
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
        title: '岗位',
        dataIndex: 'appointmentList',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { appointmentList: { name: string;id: string; }[]; }; }) => {
          const data = record?.appointmentList?.map((item) => item.name)
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
    const pagination = ref({ pageNumber: 1, pageSize: 10 })
    const selectModelValue = ref<string[]>((props.value ?? []).map(e => { return e.id }))
    const selectValue = ref<{ id: string; name: string; }[]>(props.value ?? [])
    const ok = (values: { id: string; name: string; }[]): void => {
      selectValue.value = values
      selectModelValue.value = values.map(e => { return e.id })
      modalVisible.value = false
    }
    const changePage = (value: { pageNumber: number; pageSize: number; }): void => {
      pagination.value = value
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
    onMounted(() => {
      deptList().then(res => {
        search.value[0].componentProps.treeData = res.data as never[]
      })
      // 职位
      getPositionList().then(res => {
        search.value[1].componentProps.options = res.data as never[]
      })
      getRoleList().then(res => {
        search.value[3].componentProps.options = res.data as never[]
      })
      // 岗位
      getAppointmentList().then(res => {
        search.value[2].componentProps.options = (res.data as unknown as { pages: number; total: number; records: unknown[]; })?.records as never[]
      })
    })

    expose({
      openModal
    })

    return () =>
      <ModalTable
        ref={modalTableRef}
        v-model:show={modalVisible.value}
        columns={columns}
        title={props.title ?? '选择人员'}
        search={search.value}
        multiple={props.multiple}
        apiFunction={getUserPage}
        onOk={ok}
        onChangePage={changePage}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
        searchParams={{ enabled: true }}
        showSelectedTotal={true}
      />
  }
})
