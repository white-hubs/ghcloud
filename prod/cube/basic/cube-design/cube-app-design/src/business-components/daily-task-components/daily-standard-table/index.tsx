import { useCubeTable } from '../../../base-components/cube-table/use-table'
import { cubeDailyTaskService } from '../../../api/service'
import { PopOver } from '@ghcloud/cube-ui'
import { defineComponent, reactive } from 'vue'
import { getCurrentDailyType, type StandardModel } from '@ghcloud/cube-daily-task-service'
import { Button, Input, Space } from 'ant-design-vue'
import { DailyTaskTypeSelect } from '../daily-task-type-select'

interface Props {
  enable?: boolean;
}

export const DailyStandardTable = defineComponent({
  props: ['enable'],
  setup: (props: Props, { expose }) => {
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
        dataIndex: 'description',
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
      keyword: undefined,
      categoryId: undefined,
      enable: props.enable ?? undefined,
    })
    const [StandardTable, standardTableApi] = useCubeTable({
      columns,
      rowSelection: 'checkbox',
      rowKey: 'id',
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
        return cubeDailyTaskService.getDailyStandardPage({
          pageNumber: params?.current as number || 1,
          pageSize: params?.pageSize as number || 10,
          dailyType: getCurrentDailyType(),
          name: state.keyword || '',
          categoryId: state.categoryId || '',
          enable: state.enable,
        })
      }
    })
    expose({
      getStandardSelectedRows: () => {
        return standardTableApi.getSelectedRows()
      },
      setStandardSelectedKeys: (keys: string[]) => {
        standardTableApi.setSelectedRowKeys(keys)
      },
      setStandardSelectedRows: (rows: StandardModel[]) => {
        standardTableApi.setSelectedRows(rows)
        standardTableApi.setSelectedRowKeys(rows.map((row) => row.id))
      }
    })
    return (): JSX.Element => (
      < >
        <Space>
          <Input v-model:value={state.keyword} placeholder='名称' />
          <DailyTaskTypeSelect
            v-model:value={state.categoryId}
            width={150}
          />
          <Button
            type='primary' onClick={() => {
              standardTableApi.resetFetch()
            }}
          >搜索
          </Button>
          <Button onClick={() => {
            state.keyword = undefined
            state.categoryId = undefined
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
