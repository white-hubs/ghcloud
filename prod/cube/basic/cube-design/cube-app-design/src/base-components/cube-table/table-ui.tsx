import { AliasTable } from "./components/alias-table";
import styles from "./cube-table.module.less";
import type { TableApi } from "./table-api";
import type { TableApiOptions } from "./table.type";
import type { Key } from "ant-design-vue/es/_util/type";
import { computed, defineComponent } from "vue";
import { useTableXScroll } from '../../hooks/use-table-x-scroll'

export const createTableComponent = (tableApi: TableApi, options: TableApiOptions): typeof CubeTable => {
  const CubeTable = defineComponent({
    setup: () => {
      const rowSelection = computed(() => {
        if (tableApi.state.rowSelection) {
          return {
            type: tableApi.state.rowSelection,
            selectedRowKeys: tableApi.getSelectedRowKeys(),
            preserveSelectedRowKeys: true,
            onChange: (selectedRowKeys: Key[], selectedRows: unknown[]): void => {
              tableApi.setSelectedRowKeys(selectedRowKeys);
              tableApi.setSelectedRows(selectedRows as Record<string, unknown>[]);
              tableApi.rowSelectionChange();
            },
            getCheckboxProps: options.getCheckboxProps,
          };
        }
        return null;
      });
      const tableXScroll = useTableXScroll() // 表格水平滚动条控制

      const aliasTableChange = (): void => {
        tableApi.query();
        if (tableXScroll.isEnabled.value) {
          setTimeout(() => {
            tableXScroll.updateTableXScroll()
          }, 100)
        }
      };
      return (): JSX.Element => (
        <div class={styles["cube-table"]} id="cube-table">
          <AliasTable
            rowKey={tableApi.state.rowKey ?? "id"}
            scrollY={tableApi.state.scrollY}
            pagination={tableApi.state.pagination}
            loading={tableApi.loading.value}
            rowSelection={rowSelection.value}
            columns={tableApi.state.columns}
            dataSource={tableApi.state.dataSource}
            tableCode={options.tableCode}
            customRow={options.customRow}
            onChange={aliasTableChange}
          />
        </div>
      );
    },
  });
  return CubeTable;
};
