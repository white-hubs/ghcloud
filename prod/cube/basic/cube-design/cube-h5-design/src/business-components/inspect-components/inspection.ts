import { showNotify } from 'vant'
import { reactive } from 'vue'
import type { InspectionParams } from './inspection-task/type'

export abstract class Inspection<T> {
  public searchParams: InspectionParams
  public dataSource: T[] = reactive([])
  public dataDetail = reactive({}) as Record<string, unknown>

  public loadingStatus = reactive({
    loading: false,
    finished: false,
    refreshing: false
  })

  protected constructor (defaultParams: Record<string, unknown>) {
    this.searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      ...defaultParams
    })
  }

  // 抽象方法必须由子类实现
  protected abstract getListData (
    params: InspectionParams
  ): Promise<unknown>

  // 加载分页数据
  public async loadData (): Promise<void> {
    try {
      this.loadingStatus.loading = true
      this.searchParams.pageNumber = (this.searchParams.pageNumber ?? 0) + 1
      const res = await this.getListData(this.searchParams) as { records: T[]; total: number; }
      this.dataSource = [...this.dataSource, ...res.records]
      this.loadingStatus.finished = res.total <= this.dataSource.length
    } catch (error) {
      const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
      showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      this.loadingStatus.finished = true
    } finally {
      this.loadingStatus.loading = false
      this.loadingStatus.refreshing = false
    }
  }

  // 重置分页
  public resetPagination (): void {
    this.searchParams.pageNumber = 0
    this.dataSource = []
    this.loadingStatus.finished = false
  }

  // 刷新列表数据
  public async refreshData (): Promise<void> {
    this.resetPagination()
    await this.loadData()
  }

  // 更新搜索参数
  public updateSearchParams (params: InspectionParams): void {
    Object.assign(this.searchParams, params)
  }

  // 加载详情数据
  public async loadDetailData<R = unknown> (
    Fn: (payload: R) => Promise<Record<string, unknown>>,
    payload: R
  ): Promise<void> {
    try {
      this.loadingStatus.loading = true
      this.dataDetail = await Fn(payload)
    } catch (error) {
      const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
      showNotify({ type: 'danger', message: errorMessage || '请求失败' })
    } finally {
      this.loadingStatus.loading = false
    }
  }

  // 新增通用提交方法
  public async handleSubmit<R = unknown> (
    Fn: (payload: R) => Promise<unknown>,
    payload: R,
    message?: string
  ): Promise<void> {
    try {
      this.loadingStatus.loading = true
      await Fn(payload)
      // 刷新列表数据
      this.refreshData()
      if (message) {
        showNotify({ type: 'success', message })
      }
    } catch (err) {
      const { errorMessage } = (err as { toJSON: () => { errorMessage: string; }; }).toJSON()
      showNotify({ type: 'danger', message: errorMessage || '请求失败' })
    } finally {
      this.loadingStatus.loading = true
    }
  }
}
