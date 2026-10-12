import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Button, Form, FormItem, Page, PopOver, Table, Select } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import './index.less'
import { getRentRecordPage } from '@/api/operation'

export const RentControlRecord = defineComponent({
  setup: () => {
    const columns = [
      {
        title: '房间ID',
        dataIndex: 'roomId',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '出售面积',
        dataIndex: 'roomAreaCalculate',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '房间单位名',
        dataIndex: 'roomUnitName',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '房间状态',
        dataIndex: 'status',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = statusOptions.value.find(item => item.value === text)?.label
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '预定状态',
        dataIndex: 'reserveStatus',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = (text === null || text === undefined) ? '' : Number(text) === 1 ? '已预定' : '未预定'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '锁定状态',
        dataIndex: 'lockedStatus',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = (text === null || text === undefined) ? '' : Number(text) === 1 ? '已锁定' : '未锁定'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '房间缴费状态',
        dataIndex: 'payStatus',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = (text === null || text === undefined) ? '' : Number(text) === 1 ? '欠费' : '正常缴费'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '合同类型',
        dataIndex: 'contractType',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const dataSource = ref<unknown[]>([])
    const statusOptions = ref([
      { label: '闲置', value: '0' },
      { label: '已租', value: '1' },
      { label: '预定', value: '2' },
      { label: '已售', value: '16' },
    ])
    const state = reactive({
      loading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        status: null,
        total: 0,
      },
    })
    const getTableData = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          status: state.searchParams.status,
        }
        const res = await getRentRecordPage(params)
        dataSource.value = res.records
        state.searchParams.total = res.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getTableData()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      const initParams = {
        pageNumber: 1,
        pageSize: 10,
        status: null,
        total: 0
      }
      state.searchParams = initParams
      getTableData()
    }
    const { scrollY } = useTableScroll()
    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': () => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0' }}>
              <FormItem label='房间状态' class='search-item'>
                <Select placeholder='请选择房间状态' options={statusOptions.value} v-model:value={state.searchParams.status} style='min-width: 150px;' />
              </FormItem>
              <FormItem class='search-item'>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              rowKey='id'
              dataSource={dataSource.value}
              columns={columns}
              loading={state.loading}
              pagination={false}
              size='middle' scrollX={1000} scrollY={scrollY.value}
            />
          </>
        )
      },
      'footer-page': () => {
        return (
          <Page
            v-model:current={state.searchParams.pageNumber}
            v-model:pageSize={state.searchParams.pageSize}
            v-model:total={state.searchParams.total}
            onPageChange={changePage}
          />
        )
      }
    }
    return () =>
      <>
        <Layout title='项目管理' v-slots={layoutSlots} />
      </>
  }
})
