import type { TableColumnType } from "ant-design-vue";
import { computed, defineComponent, type PropType } from "vue";

import NoData from "@/shared-ui/panel/noData";

import "./tableData.module.less";

export const TableData = defineComponent({
  name: "TableData",
  props: {
    dataSource: { type: Array as PropType<Record<string, any>[]>, required: true, default: () => [] },
    columns: { type: Array as PropType<TableColumnType[]>, required: true, default: () => [] },
  },
  setup(props) {
    const visibleColumns = computed(() => props.columns.filter((item) => typeof item.dataIndex === "string"));
    const hasData = computed(() => Array.isArray(props.dataSource) && props.dataSource.length > 0);

    const getCellValue = (row: Record<string, any>, column: TableColumnType): string => {
      const key = column.dataIndex;
      if (typeof key !== "string") return "-";
      const value = row?.[key];
      if (value === null || value === undefined || value === "") return "-";
      if (typeof value === "number") return value.toLocaleString();
      return String(value);
    };

    return (): JSX.Element => (
      <div class="meat-transaction-table">
        <div class="meat-transaction-table__header">
          {visibleColumns.value.map((column) => (
            <div class="meat-transaction-table__cell" key={String(column.dataIndex)}>
              {column.title as string}
            </div>
          ))}
        </div>
        <div class="meat-transaction-table__body">
          {hasData.value ? (
            props.dataSource.map((row, rowIndex) => (
              <div class="meat-transaction-table__row" key={row?.id ?? row?.summaryDate ?? rowIndex}>
                {visibleColumns.value.map((column) => (
                  <div class="meat-transaction-table__cell" key={String(column.dataIndex)} title={getCellValue(row, column)}>
                    {getCellValue(row, column)}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div class="meat-transaction-table__empty">
              <NoData />
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default TableData;
