import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, DateRangePicker, Button, Table, Input } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { treatedWater } from '@/apis/water-purification'

export const waterDetails = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;
        period: string[];
      };
    }>({
      loading: false,
      dataSource: [],
      searchParams: {
        keyword: '',
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        period: [dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          period: state.searchParams.period ? state.searchParams.period.join(',') : ''
        }
        const { data } = await treatedWater(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
        align: 'center'
      },
      {
        title: '用水区域',
        dataIndex: 'areaName',
        key: 'areaName',
        align: 'center'
      },
      {
        title: '净水类型',
        dataIndex: 'waterType',
        key: 'waterType',
        align: 'center'

      }, {
        title: '用量',
        dataIndex: 'waterUsage',
        key: 'waterUsage',
        align: 'center',
        customRender: ({ text }: { text: number; }): string => {
          return text ? `${text} m³` : '--'
        }
      },
      {
        title: '开始运行时间',
        dataIndex: 'dateHour',
        key: 'dateHour',
        align: 'center',
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
      state.searchParams.keyword = ''
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
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='设备名称'>
              <Input showCount={false} v-model:value={state.searchParams.keyword} placeholder='请输入设备名称' />
            </FormItem>
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
    return (): JSX.Element => <GLayout title='净水记录' v-slots={layoutSlots} />
  }
})
