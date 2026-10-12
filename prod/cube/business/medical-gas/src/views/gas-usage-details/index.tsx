import { defineComponent, reactive, onMounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Input, DateRangePicker, Button, Table } from '@ghcloud/cube-ui'
import { getGasUsageRecord } from '@/apis/gas-usage-details'
import dayjs from 'dayjs'
export const GasUsageDetails = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;
        period: string;
      };
    }>({
      loading: false,
      dataSource: [],
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        keyword: '',
        period: ''
      }
    })
    const periodRange = ref<string[]>([dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          period: periodRange.value ? periodRange.value.join(',') : ''
        }
        const { data } = await getGasUsageRecord(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
      {
        title: '设备所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
      },
      {
        title: '气体',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '用量',
        dataIndex: 'dataValue',
        key: 'dataValue',
      },
      {
        title: '使用时间',
        dataIndex: 'collectionTime',
        key: 'collectionTime',
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
    ]
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      periodRange.value = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      getList()
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getList()
    })
    const layoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='设备名称'>
              <Input placeholder='请输入设备名称' v-model:value={state.searchParams.keyword} />
            </FormItem>
            <FormItem label='时间'>
              <DateRangePicker v-model:value={periodRange.value} picker='date' />
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
      'content-table': (): JSX.Element => {
        return <Table columns={columns} loading={state.loading} dataSource={state.dataSource} pagination={false} size='small' scrollY={500} />
      },
      'footer-page': (): JSX.Element => {
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
    return (): JSX.Element => <GLayout title='气体用量明细' v-slots={layoutSlots} />
  }
})
