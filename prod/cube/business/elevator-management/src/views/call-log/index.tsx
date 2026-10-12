import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, DateRangePicker, Button, Table } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { liftFiveCallLogPage } from '@/apis/lift'

export const CallLog = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        transportWay: string | null;
        area: string[];
        period: string[];
      };
    }>({
      loading: false,
      dataSource: [],
      searchParams: {
        area: [],
        transportWay: null,
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        period: [],
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          pageNumber: state.searchParams.pageNumber,
          pageSize: state.searchParams.pageSize,
          period: state.searchParams.period ? state.searchParams.period.join(',') : ''
        }
        const { data } = await liftFiveCallLogPage(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '来电人信息',
        dataIndex: 'caller',
        key: 'caller',
        align: 'center',
      },
      {
        title: '日期',
        dataIndex: 'callTime',
        key: 'callTime',
        align: 'center',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '电梯编号',
        dataIndex: 'liftNumber',
        key: 'liftNumber',
        align: 'center'
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
        align: 'center'
      },
      {
        title: '通话内容',
        dataIndex: 'callContent',
        key: 'callContent',
        align: 'center'

      }, {
        title: '处理情况',
        dataIndex: 'handlingSituation',
        key: 'handlingSituation',
        align: 'center'
      },
    ]
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.area = []
      state.searchParams.transportWay = ''
      state.searchParams.period = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      getList()
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(async () => {
      await getList()
    })
    const layoutSlots = {
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem label='时间'>
              <DateRangePicker v-model:value={state.searchParams.period} picker='date' />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': () => {
        return <Table columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' scrollY={500} />
      },
      'footer-page': () => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return () => <GLayout title='五方通话记录' v-slots={layoutSlots} />
  }
})
