import { bindMethods } from "../../utils/index";
import type { TableApiOptions, TableProps } from "./table.type";
import type { Key } from "ant-design-vue/es/table/interface";
import type { Ref, UnwrapNestedRefs } from "vue";
import { reactive, ref } from "vue";

export class TableApi {
  public state: UnwrapNestedRefs<TableProps> = reactive({
    columns: [],
    dataSource: [],
  });

  public loading: Ref<boolean> = ref(false);
  private readonly selectedRowKeys: Ref<Key[]> = ref([]);
  private selectedRows: unknown[] = [];
  private readonly api: Pick<TableApiOptions, "rowSelectionChange" | "fetchApi" | "fetchLoaded">;
  private autoFetchTimer: ReturnType<typeof setTimeout> | null = null;

  public constructor(options: TableApiOptions) {
    const { rowSelectionChange, fetchApi, fetchLoaded, ...optionsState } = options;
    this.checkDataIndexUnique();
    this.api = {
      rowSelectionChange,
      fetchApi,
      fetchLoaded,
    };
    Object.assign(this.state, optionsState);
    bindMethods(this);
    optionsState.autoFetch = optionsState.autoFetch ?? true;
    if (optionsState.autoFetch) {
      this.autoFetchTimer = setTimeout(() => {
        this.autoFetchTimer = null;
        this.fetchData();
      }, 0);
    }
  }

  // 设置列
  public setColumns(columns: TableProps["columns"]): void {
    this.state.columns = columns;
  }

  // 设置数据
  public setDataSource(dataSource: TableProps["dataSource"]): void {
    this.state.dataSource = dataSource;
  }

  public getDataSource(): unknown[] | undefined {
    return this.state.dataSource;
  }
  public setSelectedRowKeys(selectedRowKeys: Key[]): void {
    this.selectedRowKeys.value = selectedRowKeys;
  }

  public getSelectedRowKeys(): Key[] {
    return this.selectedRowKeys.value;
  }

  public setState(state: Partial<TableProps>): void {
    Object.assign(this.state, state);
  }

  public setSelectedRows(selectedRows: unknown[]): void {
    this.selectedRows = selectedRows;
  }

  public getSelectedRows(): unknown[] {
    return this.selectedRows;
  }

  public rowSelectionChange(): void {
    this.api.rowSelectionChange?.(this.selectedRowKeys.value, this.selectedRows);
  }

  public query(): void {
    this.cancelAutoFetch();
    this.fetchData();
  }

  // 如果声明时传入了page信息，则重置分页信息，重新获取数据
  public resetFetch(): void {
    this.cancelAutoFetch();
    if (typeof this.state.pagination === "object") {
      this.state.pagination.current = 1;
      this.state.pagination.pageSize = 10;
    }
    this.fetchData();
  }

  /**
   * 判断 columns 中的 dataIndex 是否唯一
   */
  private checkDataIndexUnique(): void {
    const columnsDataIndex = this.state.columns.map((item) => item.dataIndex);
    const columnsDataIndexSet = new Set(columnsDataIndex);
    if (columnsDataIndex.length !== columnsDataIndexSet.size) {
      throw new Error("dataIndex must be unique");
    }
  }

  private cancelAutoFetch(): void {
    if (this.autoFetchTimer) {
      clearTimeout(this.autoFetchTimer);
      this.autoFetchTimer = null;
    }
  }

  /**
   * 调用接口获取数据
   */
  private async fetchData(): Promise<void> {
    if (!this.api.fetchApi) {
      return;
    }
    try {
      this.loading.value = true;
      const result = typeof this.state.pagination === "object" ? await this.api.fetchApi(this.state.pagination) : await this.api.fetchApi();
      this.state.dataSource = result?.records ?? [];
      if (typeof this.state.pagination === "object") {
        this.state.pagination.total = result?.total ?? 0;
      }
      this.api?.fetchLoaded?.(result);
    } finally {
      this.loading.value = false;
    }
  }
}
