export interface Type {
  id: string;
  name: string;
}
// 巡检结果统计查询
export interface InspectionResults {
  typeId?: string;
  taskName?: string;
  period: [string, string];
  depName?: string | undefined;
}
