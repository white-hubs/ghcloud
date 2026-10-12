import { defineComponent, ref, watch, type PropType } from 'vue'
import { Table } from '@ghcloud/cube-ui'
import { cubeAssetManagementService } from '@/api/server'
import { AssocType } from '../association-tabs'

export const PropertyPane = defineComponent({
  props: {
    disabled: { type: Boolean, default: false },
    selectValue: { type: Array as PropType<{ targetTypeId: string; type: string; }[]>, default: () => [] },
  },
  emits: ['update:selectValue'],
  setup (props, { emit }) {
    const selectionDisabled = props.disabled
    const dataSource = ref<{ id: string; name: string; }[]>([])
    const selectValue = ref<{ targetTypeId: string; type: string; }[]>(props.selectValue)
    const selectedRowKeys = ref<string[]>(selectValue.value.map(e => e.targetTypeId))

    watch(
      () => props.selectValue,
      (newVal: { targetTypeId: string; type: string; }[] | undefined): void => {
        selectValue.value = newVal ?? []
        selectedRowKeys.value = selectValue.value.map(e => e.targetTypeId)
      },
      { immediate: true }
    )

    cubeAssetManagementService.getAssemblyClassifyPage({
      pageNumber: 1,
      pageSize: 1000,
      type: 'assetType',
    }).then(res => {
      dataSource.value = res?.records || []
    })

    const columns = [
      {
        title: '类型名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'left',
      },
    ]
    return (): JSX.Element => (
      <Table
        columns={columns}
        dataSource={dataSource.value}
        rowKey='id'
        pagination={false}
        size='small'
        rowSelection={{
          type: 'checkbox',
          checkStrictly: false,
          selectedRowKeys: selectedRowKeys.value,
          onChange: (keys: string[], selectedRows: { id: string; name: string; }[]) => {
            selectedRowKeys.value = keys
            selectValue.value = selectedRows.map(e => ({ targetTypeId: e.id, type: AssocType.PROPERTY }))
            emit('update:selectValue', selectValue.value)
          },
          getCheckboxProps: () => ({
            disabled: selectionDisabled,
          }),
        }}
      />
    )
  }
})