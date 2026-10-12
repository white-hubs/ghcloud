import { useCubeTable } from '../../../base-components/cube-table/use-table'
import { cubeDailyInspectionService } from '../../../api/service'
import { Form, FormItem, PopOver, Select } from '@ghcloud/cube-ui'
import { defineComponent, reactive } from 'vue'
import { targetCategoryOptions, type StandardItemType } from '@ghcloud/cube-daily-inspection-service'
import { Button, Input, Space } from 'ant-design-vue'
import styles from './index.module.less'

export const InspectItemTable = defineComponent({
  props: {
    businessType: {
      type: String,
      default: 'SMALLENFINEERING'
    }
  },
  setup: (props, { expose }) => {
    const state = reactive({
      keyword: '',
      referType: ''
    })
    const columns = [
      {
        dataIndex: 'alias',
        title: '巡检项名称',
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
        dataIndex: 'name',
        title: '巡检项内容',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'resultNames',
        title: '巡检结果',
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
        dataIndex: 'referTypeNames',
        title: '适用对象',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      }
    ]
    const [ItemTable, itemTableApi] = useCubeTable({
      columns,
      rowSelection: 'checkbox',
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: 'default', // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          itemTableApi.setState({
            pagination: {
              ...(itemTableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
          itemTableApi.query()
        }
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        if (params) {
          return cubeDailyInspectionService.getInspectStandardItemPage({
            pageNumber: params.current as number,
            pageSize: params.pageSize as number,
            keyword: state.keyword,
            referType: state.referType,
            businessType: props.businessType
          })
        }
        return cubeDailyInspectionService.getInspectStandardItemPage({
          pageNumber: 1,
          pageSize: 10,
          keyword: state.keyword,
          referType: state.referType,
          businessType: props.businessType
        })
      },
    })
    expose({
      getInspectItemSelectedRows: () => {
        return itemTableApi.getSelectedRows()
      },
      setInspectItemSelectedRows: (rows: StandardItemType[]) => {
        itemTableApi.setSelectedRows(rows)
        itemTableApi.setSelectedRowKeys(rows.map((row) => row.id))
      }
    })
    return (): JSX.Element => (
      < >
        {
          props.businessType === 'SMALLENFINEERING' &&
          <Space>
            <Input v-model:value={state.keyword} placeholder='巡检项名称' />
            <Button
              type='primary' onClick={() => {
                itemTableApi.resetFetch()
              }}
            >搜索
            </Button>
            <Button onClick={() => {
              state.keyword = ''
              itemTableApi.resetFetch()
            }}
            >重置
            </Button>
          </Space>
        }
        {
          props.businessType !== 'SMALLENFINEERING' &&
          <Form layout='inline' >
            <FormItem label='对象类型' class={styles['search-item']}>
              <Select v-model:value={state.referType} placeholder='对象类型' options={targetCategoryOptions} style={{ width: '150px' }} />
            </FormItem>
            <FormItem label='' class={styles['search-item']}>
              <Input v-model:value={state.keyword} placeholder='请输入巡检对象名称' />
            </FormItem>
            <FormItem label='' class={styles['search-item']}>
            <Button
              type='primary' onClick={() => {
                itemTableApi.resetFetch()
              }}
            >查询
            </Button>
            <Button onClick={() => {
              state.keyword = ''
              state.referType = ''
              itemTableApi.resetFetch()
            }}
            >重置
            </Button>
          </FormItem>
        </Form>
        }
        <div style={{ marginTop: '12px' }}>
          <ItemTable />
        </div>
      </>
    )
  }
})
