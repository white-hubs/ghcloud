import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Input, Button, DateRangePicker, Table } from '@ghcloud/cube-ui'
import { getAlarmDeviceStatistic } from '@/api/statistics-analysis'
export const AlarmDeviceStatistics = defineComponent({
  setup: () => {
    const state = reactive({
      loading: false,
      dataSource: [],
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        keyword: ''
      },
    })
    const period = ref<string[]>()
    const columns = [
      {
        dataIndex: 'deviceName',
        title: '设备名称',
      },
      {
        dataIndex: 'deviceCode',
        title: '设备编号',
      },
      {
        dataIndex: 'gearPositionCode',
        title: '档位号',
      },
      {
        dataIndex: 'areaName',
        title: '所属区域',
      },
      {
        dataIndex: 'totalNum',
        title: '报警总数',
      },
      {
        dataIndex: 'unConfirmedNum',
        title: '待接收报警数',
      },
      {
        dataIndex: 'progressConfirmedNum',
        title: '处理中报警数',
      },
      {
        dataIndex: 'handlerNum',
        title: '已处理报警数',
      },
      {
        dataIndex: 'suspendNum',
        title: '已挂起报警数',
      },
      {
        dataIndex: 'timeoutNum',
        title: '超时报警数',
      },
    ]
    const getList = async (): Promise< void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          period: period.value ? period.value.join(',') : ''
        }
        const { data } = await getAlarmDeviceStatistic(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getList()
    })
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleChangePicker = (value: string[]): void => {
      period.value = value
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.pageSize = 10
      state.searchParams.keyword = ''
      period.value = []
      getList()
    }
    const layoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <>
            <Form layout='inline'>
              <FormItem label='报警时间'>
                <DateRangePicker picker='date' v-model:value={period.value} onChangePicker={handleChangePicker} />
              </FormItem>
              <FormItem>
                <Input v-model:value={state.searchParams.keyword} placeholder='请输入档位号' />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                </div>
              </FormItem>
            </Form>
          </>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <Table
            dataSource={state.dataSource}
            columns={columns}
            loading={state.loading}
            pagination={false}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />
          </>
        )
      },
    }
    return (): JSX.Element => (
      <GLayout title='设备报警统计' v-slots={layoutSlots} />
    )
  }
})
