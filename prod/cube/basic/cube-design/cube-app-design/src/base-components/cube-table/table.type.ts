import type { ColumnType } from "@ghcloud/cube-ui";
import type { Key } from "ant-design-vue/es/table/interface";
import type { CubeQueryStateApi, CubeQueryState } from "../../hooks/use-cube-query-state";
interface PageResultVo {
  total: number;
  pages: number;
  records: unknown[];
}
export interface TableProps {
  /** 表格数据 */
  dataSource?: unknown[];
  /** 表格列配置 */
  columns: ColumnType[] | Record<string, unknown>[];
  rowSelection?: "checkbox" | "radio";
  scrollY?: number;
  tableCode?: string;
  rowKey?: string;
  pagination?: boolean | Record<string, unknown>;
  /** 是否自动加载数据 */
  autoFetch?: boolean;
  customRow?: (record: unknown, index: number) => unknown;
}
export interface TableApiOptions extends TableProps {
  rowSelectionChange?: (selectedRowKeys: Key[], selectedRows: unknown[]) => void;
  fetchApi?: (params?: Record<string, unknown>) => Promise<PageResultVo>;
  fetchLoaded?: (params: PageResultVo) => void;
  getCheckboxProps?: (record: Record<string, unknown>) => { disabled: boolean };
  queryState?: CubeQueryStateApi<CubeQueryState>;
}
