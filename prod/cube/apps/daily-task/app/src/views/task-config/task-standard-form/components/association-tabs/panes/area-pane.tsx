import { defineComponent, ref, type PropType, watch } from 'vue'
import { Table } from '@ghcloud/cube-ui'
import { cubeMdataService } from '@/api/server'
import type { AreaTree } from '@ghcloud/cube-mdata-service'
import { AssocType } from '../association-tabs'

export const AreaPane = defineComponent({
  props: {
    disabled: { type: Boolean, default: false },
    selectValue: { type: Array as PropType<{ targetTypeId: string; type: string; }[]>, default: () => [] },
  },
  emits: ['update:selectValue'],
  setup (props, { emit }) {
    const selectionDisabled = props.disabled
    const dataSource = ref<AreaTree[]>([])
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

    cubeMdataService.getAreaTree().then(res => {
      dataSource.value = res
    })

    const columns = [
      {
        title: '区域名称',
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
          onChange: (keys: string[], selectedRows: AreaTree[]) => {
            selectedRowKeys.value = keys
            selectValue.value = selectedRows.map(e => ({ targetTypeId: e.id, type: AssocType.AREA }))
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