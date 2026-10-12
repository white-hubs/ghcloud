import { useCubeTable } from '../../../base-components/cube-table/use-table'
import { cubeDailyInspectionService } from '../../../api/service'
import { PopOver } from '@ghcloud/cube-ui'
import { defineComponent, reactive } from 'vue'
import type { StandardVOS } from '@ghcloud/cube-daily-inspection-service'
import type { Key } from 'ant-design-vue/es/table/interface'
import { Button, Input, Space } from 'ant-design-vue'

export const InspectStandardTable = defineComponent({
  props: {
    businessType: {
      type: String,
      default: 'SMALLENFINEERING'
    }
  },
  setup: (props, { expose }) => {
    const selectedRowMap = new Map<string, StandardVOS>()
    const columns = [
      {
        dataIndex: 'name',
        title: '名称',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'remark',
        title: '说明',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
    ]
    const state = reactive({
      keyword: ''
    })
    const [StandardTable, standardTableApi] = useCubeTable({
      columns,
      rowSelection: 'checkbox',
      rowSelectionChange: (selectedRowKeys: Key[], selectedRows: unknown[]) => {
        const selectedKeys = new Set(selectedRowKeys.map((key) => String(key)))
        Array.from(selectedRowMap.keys()).forEach((key) => {
          if (!selectedKeys.has(key)) {
            selectedRowMap.delete(key)
          }
        })
        ;(selectedRows as StandardVOS[]).forEach((row) => {
          if (row?.id) {
            selectedRowMap.set(String(row.id), row)
          }
        })
        standardTableApi.setSelectedRows(Array.from(selectedRowMap.values()))
      },
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: 'default', // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          standardTableApi.setState({
            pagination: {
              ...(standardTableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
          standardTableApi.query()
        }
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        if (params) {
          return cubeDailyInspectionService.InspectStandardPage({
            pageNumber: params.current as number,
            pageSize: params.pageSize as number,
            keyword: state.keyword,
            businessType: props.businessType
          })
        }
        return cubeDailyInspectionService.InspectStandardPage({
          pageNumber: 1,
          pageSize: 10,
          keyword: state.keyword,
          businessType: props.businessType
        })
      },
      fetchLoaded: (result) => {
        const selectedKeys = new Set(standardTableApi.getSelectedRowKeys().map((key) => String(key)))
        ;(result.records as StandardVOS[]).forEach((row) => {
          if (row?.id && selectedKeys.has(String(row.id))) {
            selectedRowMap.set(String(row.id), row)
          }
        })
        standardTableApi.setSelectedRows(Array.from(selectedRowMap.values()))
      },
    })
    expose({
      getStandardSelectedRows: () => {
        return standardTableApi
          .getSelectedRowKeys()
          .map((key) => selectedRowMap.get(String(key)))
          .filter((row): row is StandardVOS => Boolean(row))
      },
      setStandardSelectedRows: (rows: StandardVOS[]) => {
        selectedRowMap.clear()
        rows.forEach((row) => {
          if (row?.id) {
            selectedRowMap.set(String(row.id), row)
          }
        })
        const selectedRows = Array.from(selectedRowMap.values())
        standardTableApi.setSelectedRows(selectedRows)
        standardTableApi.setSelectedRowKeys(selectedRows.map((row) => row.id))
      }
    })
    return (): JSX.Element => (
      < >
        <Space>
          <Input v-model:value={state.keyword} placeholder='名称' />
          <Button
            type='primary' onClick={() => {
              standardTableApi.resetFetch()
            }}
          >搜索
          </Button>
          <Button onClick={() => {
            state.keyword = ''
            standardTableApi.resetFetch()
          }}
          >重置
          </Button>
        </Space>
        <div style={{ marginTop: '12px' }}>
          <StandardTable />
        </div>
      </>
    )
  }
})
