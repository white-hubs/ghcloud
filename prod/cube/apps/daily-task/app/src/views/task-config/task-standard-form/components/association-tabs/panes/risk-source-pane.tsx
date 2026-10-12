import { defineComponent, ref, watch, type PropType } from 'vue'
import { Table } from '@ghcloud/cube-ui'
import { cubeRiskTypeService } from '@/api/server'
import { AssocType } from '../association-tabs'

export const RiskSourcePane = defineComponent({
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

    cubeRiskTypeService.getType({ itemCode: 'risk-source-type', pageNumber: 1, pageSize: 1000 }).then(res => {
      dataSource.value = res || []
    })

    const columns = [
      {
        title: '风险源名称',
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
        childrenColumnName='nextList'
        size='small'
        rowSelection={{
          type: 'checkbox',
          checkStrictly: false,
          selectedRowKeys: selectedRowKeys.value,
          onChange: (keys: string[], selectedRows: { id: string; name: string; }[]) => {
            selectedRowKeys.value = keys
            selectValue.value = selectedRows.map(e => ({ targetTypeId: e.id, type: AssocType.RISK_SOURCE }))
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