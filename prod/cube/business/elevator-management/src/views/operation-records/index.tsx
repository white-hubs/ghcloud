import { defineComponent, reactive, onMounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, DateRangePicker, Button, Table, Select, Cascader } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { getAreaList, liftRecord } from '@/apis/lift'

export const GasUsageDetails = defineComponent({
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
        period: [dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
      }
    })
    const departmentType = ref([])
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          area: state.searchParams.area ? state.searchParams.area.join(',') : '',
          period: state.searchParams.period ? state.searchParams.period.join(',') : ''
        }
        const { data } = await liftRecord(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const operationMode = [
      {
        label: '人脸识别',
        value: 'FACE_RECOGNITION'
      },
      {
        label: '刷卡',
        value: 'SWIPE'
      },
      {
        label: '按钮',
        value: 'BUTTON'
      },
    ]
    const columns = [
      {
        title: '运行方式',
        dataIndex: 'transportWay',
        key: 'transportWay',
        align: 'center',
        customRender: ({ text }: { text: string; }) => {
          switch (text) {
            case 'FACE_RECOGNITION':
              return '人脸识别'
            case 'SWIPE':
              return '刷卡'
            case 'BUTTON':
              return '按钮'
            default:
              return '--'
          }
        }
      },
      {
        title: '抵达楼层',
        dataIndex: 'floor',
        key: 'floor',
        align: 'center'
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
        align: 'center'
      },
      {
        title: '产品分类',
        dataIndex: 'deviceType',
        key: 'deviceType',
        align: 'center'

      }, {
        title: '设备所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
        align: 'center'
      },
      {
        title: '开始运行时间',
        dataIndex: 'runTime',
        key: 'runTime',
        align: 'center',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
    ]
    // 获取部门
    const getInspectionType = async (): Promise<void> => {
      const { data } = await getAreaList()
      departmentType.value = data
    }
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
      await getInspectionType()
      await getList()
    })
    const layoutSlots = {
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem label='运行方式'>
              <Select allowClear options={operationMode} style={{ width: '140px' }} fieldNames={{ label: 'label', value: 'value' }} v-model:value={state.searchParams.transportWay} />
            </FormItem>
            <FormItem label='设备所在区域'>
              <Cascader options={departmentType.value} placeholder='请选择区域' fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.searchParams.area} />
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
    return () => <GLayout title='运行记录' v-slots={layoutSlots} />
  }
})
