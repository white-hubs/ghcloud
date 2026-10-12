import { TableApi } from './table-api'
import type { TableApiOptions } from './table.type'
import { createTableComponent } from './table-ui'
import { useTableXScroll } from '../../hooks/use-table-x-scroll'
import { onMounted, watch } from 'vue'

export const useCubeTable = (options: TableApiOptions = {
  dataSource: [],
  columns: []
}): [typeof CubeTable, TableApi, ReturnType<typeof useTableXScroll>] => {
  const queryState = options.queryState
  const tableOptions: TableApiOptions = queryState
    ? {
      ...options,
      fetchApi: async (params) => {
        queryState.writeCache()
        if (!options.fetchApi) {
          return {
            total: 0,
            pages: 0,
            records: [],
          }
        }
        return options.fetchApi(params)
      },
    }
    : options
  const tableApi = new TableApi(tableOptions) // 数据管理实例化对象
  const CubeTable = createTableComponent(tableApi, options) // 组件实例
  const tableXScroll = useTableXScroll() // 表格水平滚动条控制

  watch(() => tableApi.state.dataSource, () => {
    if (tableXScroll.isEnabled.value) {
      setTimeout(() => {
        tableXScroll.updateTableXScroll()
      }, 100)
    }
  })

  watch(() => tableApi.state.columns, () => {
    if (tableXScroll.isEnabled.value) {
      setTimeout(() => {
        tableXScroll.updateTableXScroll()
      }, 100)
    }
  })

  onMounted(() => {
    setTimeout(() => {
      if (tableXScroll.isEnabled.value) {
        tableXScroll.updateTableXScroll()
      }
    }, 200)
  })

  return [
    CubeTable,
    tableApi,
    tableXScroll
  ]
}
