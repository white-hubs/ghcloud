import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Table, Select } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import './index.less'
import { getProjectManagementPage } from '@/api/operation'
import dayjs from 'dayjs'

export const ProjectManage = defineComponent({
  setup: () => {
    const columns = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '开始时间',
        dataIndex: 'startDate',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '结束时间',
        dataIndex: 'endDate',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '项目类型',
        dataIndex: 'projectType',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '是否立项',
        dataIndex: 'departmentName',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = (text === null || text === undefined) ? '' : Number(text) === 1 ? '已立项' : '未立项'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '是否结项',
        dataIndex: 'endStatus',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const textVal = (text === null || text === undefined) ? '' : Number(text) === 1 ? '已结' : '未结'
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
    ]
    const dataSource = ref<unknown[]>([])
    const searchPeriod = ref<string[]>([])
    const foundStatusOptions = ref([
      { label: '未立项', value: '0' },
      { label: '已立项', value: '1' },
    ])
    const state = reactive({
      loading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        foundStatus: null,
        total: 0,
      },
    })
    const getTableData = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          foundStatus: state.searchParams.foundStatus,
          period: searchPeriod.value ? searchPeriod.value.join(',') : '',
        }
        const res = await getProjectManagementPage(params)
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
        foundStatus: null,
        total: 0
      }
      state.searchParams = initParams
      searchPeriod.value = []
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
              <FormItem label='选择日期' class='search-item'>
                <DateRangePicker v-model:value={searchPeriod.value} valueFormat='YYYY-MM-DD' />
              </FormItem>
              <FormItem label='是否立项' class='search-item'>
                <Select placeholder='请选择是否立项' options={foundStatusOptions.value} v-model:value={state.searchParams.foundStatus} style='min-width: 150px;' />
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
