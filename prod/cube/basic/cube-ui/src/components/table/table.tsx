import { defineComponent } from 'vue'
import { Table } from 'ant-design-vue/es'
import type { ColumnType, TablePaginationConfig } from 'ant-design-vue/es/table'
import type { FilterValue, SorterResult, TableRowSelection, TableCurrentDataSource } from 'ant-design-vue/es/table/interface'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import type { Key } from 'ant-design-vue/lib/table/interface'
import type { GetComponentProps } from 'ant-design-vue/es/vc-table/interface'

export interface ColumnOption {
  title: string;
  width: string;
  align: '1' | '2';
  sorter?: Function | boolean	;
  customRender: () => JSX.Element;
}
export type { Key }

interface Props {
  columns: ColumnOption[];
  loading: boolean;
  dataSource: unknown[];
  pagination: false | TablePaginationConfig;
  size: SizeType;
  scrollY: number;
  scrollX: number;
  rowSelection: TableRowSelection<unknown>;
  defaultExpandedRowKeys: Key[];
  rowKey: string;
  childrenColumnName: string;
  customRow: GetComponentProps<unknown> | undefined;
  sticky: boolean;
}

export default defineComponent({
  emits: ['change'],
  props: ['columns', 'defaultExpandedRowKeys', 'loading', 'dataSource', 'pagination', 'size', 'scrollY', 'scrollX', 'rowSelection', 'rowKey', 'childrenColumnName', 'customRow', 'sticky'],
  setup (props: Props, { slots, emit }) {
    const onchange = (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult | SorterResult[], extra: TableCurrentDataSource): void => {
      emit('change', pagination, filters, sorter, extra)
    }
    return (): JSX.Element=> {
      return (
        <Table
          childrenColumnName={props.childrenColumnName}
          columns={props.columns as unknown as ColumnType[]}
          bordered
          loading={props.loading}
          defaultExpandedRowKeys={props.defaultExpandedRowKeys}
          dataSource={props.dataSource}
          pagination={props.pagination}
          size={props.size}
          scroll={{ y: props.scrollY, x: props.scrollX }}
          rowSelection={props.rowSelection}
          rowKey={props.rowKey ?? 'key'}
          onChange={onchange}
          customRow={props.customRow}
          sticky={props.sticky}
        >{slots}
        </Table>
      )
    }
  }
})
