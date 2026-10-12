export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
export interface PageLeaveLedgerResult {
  total: number;
  page: number;
  records: unknown[];
  tableTitle: {
    id: number;
    name: number;
    notLimit: number;
  }[];
}
