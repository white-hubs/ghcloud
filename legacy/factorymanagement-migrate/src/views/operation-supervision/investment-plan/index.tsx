import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Button, Form, FormItem, Page, PopOver, Table, Select, DatePicker } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import './index.less'
import { getInvestmentPlanPage } from '@/api/operation'

export const InvestmentPlan = defineComponent({
  setup: () => {
    const columns = [
      {
        title: '计划月份',
        dataIndex: 'planMonth',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '计划完成目标',
        dataIndex: 'planTotal',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '目标类型',
        dataIndex: 'targetType',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = typeOptions.value.find(item => item.value === text)?.label
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '完成结果',
        dataIndex: 'planResult',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = (text === null || text === undefined) ? '' : Number(text) === 1 ? '不达标' : '达标'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '完成百分比',
        dataIndex: 'planPercent',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const dataSource = ref<unknown[]>([])
    const typeOptions = ref([
      { label: '购地', value: '1' },
      { label: '租赁', value: '2' },
      { label: '销售', value: '3' },
    ])
    const state = reactive({
      loading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        targetType: null,
        planMonth: null,
        total: 0,
      },
    })
    const getTableData = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          targetType: state.searchParams.targetType,
          planMonth: state.searchParams.planMonth,
        }
        const res = await getInvestmentPlanPage(params)
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
        planMonth: null,
        targetType: null,
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
              <FormItem label='目标类型' class='search-item'>
                <Select placeholder='请选择目标类型' options={typeOptions.value} v-model:value={state.searchParams.targetType} style='min-width: 150px;' />
              </FormItem>
              <FormItem label='计划月份' class='search-item'>
                <DatePicker v-model:value={state.searchParams.planMonth} picker='month' valueFormat='YYYY-MM' />
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
        <Layout title='招商计划' v-slots={layoutSlots} />
      </>
  }
})
