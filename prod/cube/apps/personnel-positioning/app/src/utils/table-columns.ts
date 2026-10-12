import type { FunctionalComponent } from "vue";

import { Table as CubeTable, type ColumnType } from "@ghcloud/cube-ui";

type CubeTableProps = InstanceType<typeof CubeTable>["$props"];

/** cube-ui Table 的运行时属性均可选，当前类型声明将透传属性标成了必填，因此集中在这里适配。 */
export type StaticTableProps = Partial<CubeTableProps> & Pick<CubeTableProps, "columns" | "dataSource">;

export const StaticTable = CubeTable as unknown as FunctionalComponent<StaticTableProps>;

/** cube-ui Table 运行时直接透传 Ant 列配置，旧声明仍使用字符串宽度；在此集中适配。 */
export function asCubeTableColumns<T extends object>(columns: ColumnType<T>[]): CubeTableProps["columns"] {
  return columns as unknown as CubeTableProps["columns"];
}
