import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import styles from './index.module.less'
import { Form, FormItem, DatePicker, RadioGroup, Button, Table, DateRangePicker, type PickerMode, Spin } from '@ghcloud/cube-ui'
import { LineCharts } from '@/components/chart/line-charts'
import { ChartCard } from '@/views/data-center/component/chart-card'
import { PieChart } from '@/components/chart/pie-charts'
import { GPagination } from '@/components/common/pagination'
import { getAlarmLevelsStatistic, getAlarmEventsStatistic, getAlarmDeviceTrendAnalysis, getAlarmEventRecords } from '@/api/device-center'
import { getCurrentApplication } from '@/utils/auth'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
const dateFormat = 'YYYY-MM-DD'
const monthFormat = 'YYYY-MM'
export const AlarmDataTab = defineComponent({
  setup: () => {
    const route = useRoute()
    const timeOptions = [
      { label: '年', value: 'YEAR' },
      { label: '月', value: 'MONTH' },
      { label: '日', value: 'DAY' }
    ]
    const deviceIds = route.params.id as string
    const state = reactive<{
      dataSource: Record<string, unknown>[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        type: string;
      };
      deviceAlarmLevelsStatistics: { name: string; value: number; }[];
      deviceAlarmAmountsStatistics: { name: string; value: number; }[];
      loading: boolean;
      trendStatictics: number[];
      trendChartPeriod: string[];
    }>({
      dataSource: [],
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        type: '',
      },
      loading: false,
      deviceAlarmLevelsStatistics: [],
      deviceAlarmAmountsStatistics: [],
      trendStatictics: [],
      trendChartPeriod: [],
    })
    const columns = [{
      title: '报警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
      align: 'center',
      customRender: ({ text }: { text: number; }): string => {
        return dayjs(text).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '报警事件',
      dataIndex: 'alarmEventName',
      key: 'alarmEventName',
      align: 'center'
    },
    {
      title: '报警等级',
      dataIndex: 'alarmLevelName',
      key: 'alarmLevelName',
      align: 'center'
    },
    {
      title: '处理状态',
      dataIndex: 'alarmStatusEnum',
      key: 'alarmStatusEnum',
      align: 'center',
      customRender: ({ text }: { text: string; }): string => {
        const stateusValue: Record<string, string> = {
          ALARM_UN_CONFIRMED: '待接收',
          ALARM_PROGRESS_CONFIRMED: '处理中',
          ALARM_SUSPEND: '已挂起',
          ALARM_HANDLER: '已处理'
        }
        return stateusValue[text] ?? '--'
      }
    },
    ]
    const rangePeriod = ref<string[]>([dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
    const periodValue = computed(() => {
      if (dateCheck.value === 'YEAR') {
        return yearPickerValue.value ? [dayjs(yearPickerValue.value).format('YYYY-01-01'), dayjs(yearPickerValue.value).endOf('year').format('YYYY-MM-DD')].join(',') : ''
      } else if (dateCheck.value === 'MONTH') {
        return rangePeriod.value ? [dayjs(rangePeriod.value[0]).format('YYYY-MM-01'), dayjs(rangePeriod.value[1]).format('YYYY-MM-DD')].join(',') : ''
      }
      return rangePeriod.value ? [dayjs(rangePeriod.value[0]).format('YYYY-MM-DD'), dayjs(rangePeriod.value[1]).format('YYYY-MM-DD')].join(',') : ''
    })
    // 表格数据
    const getDataSource = async (): Promise<void> => {
      const params = {
        deviceIds,
        period: periodValue.value,
        pageNumber: state.searchParams.pageNumber,
        pageSize: state.searchParams.pageSize,
        applicationCode: getCurrentApplication().code
      }
      const { data } = await getAlarmEventRecords(params)
      state.dataSource = data.records
      state.searchParams.total = data.total
    }
    // 获取设备等级统计
    const getLevelsStatistic = async (): Promise<void> => {
      const params = {
        deviceIds,
        period: periodValue.value,
        applicationCode: getCurrentApplication().code
      }
      const result = await getAlarmLevelsStatistic(params)
      const data = result.data as { alarmNum: number;code: string;id: string;name: string;ratio: string; }[]
      state.deviceAlarmLevelsStatistics = data.map(item => {
        return {
          value: item.alarmNum,
          name: item.name
        }
      })
    }
    // 设备报警趋势
    const getDeviceAlarmTrend = async (): Promise<void> => {
      const params = {
        type: dateCheck.value,
        deviceIds,
        period: periodValue.value,
        applicationCode: getCurrentApplication().code
      }
      const result = await getAlarmDeviceTrendAnalysis(params)
      const data = result.data as { timeFlag: string; num: number; }[]
      state.trendStatictics = data.map(item => item.num)
      state.trendChartPeriod = data.map(item => item.timeFlag)
    }
    // 设备事件统计
    const getEventsStatistic = async (): Promise<void> => {
      const params = {
        period: periodValue.value,
        deviceIds,
        applicationCode: getCurrentApplication().code
      }
      const result = await getAlarmEventsStatistic(params)
      const data = result.data as { totalNum: number;code: string;id: string;name: string;ratio: string; }[]
      state.deviceAlarmAmountsStatistics = data.map(item => {
        return {
          value: item.totalNum,
          name: item.name
        }
      })
    }
    const handleSearch = async (): Promise<void> => {
      state.searchParams.pageNumber = 1
      try {
        state.loading = true
        await getLevelsStatistic()
        await getEventsStatistic()
        await getDeviceAlarmTrend()
        await getDataSource()
      } catch {
      } finally {
        state.loading = false
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getDataSource()
    }
    onMounted(async () => {
      try {
        state.loading = true
        await getLevelsStatistic()
        await getEventsStatistic()
        await getDeviceAlarmTrend()
        await getDataSource()
      } catch {
      } finally {
        state.loading = false
      }
    })
    const rangePicker = computed(() => {
      const picker: Record<string, PickerMode> = {
        DAY: 'date',
        MONTH: 'month'
      }
      return picker[dateCheck.value] ?? 'date'
    })
    const rangePickerFormat = computed(() => {
      const pickerFormatMap = new Map([['MONTH', monthFormat], ['DAY', dateFormat]])
      return pickerFormatMap.get(dateCheck.value) ?? monthFormat
    })
    const handleChangePicker = (value: string[]): void => {
      rangePeriod.value = value
    }
    const dateCheck = ref('DAY')
    const yearPickerValue = ref(dayjs().format('YYYY'))
    return (): JSX.Element => (
      <Spin spinning={state.loading}>
        <div class={styles['alarm-data']}>
          <div class={styles['search-bar']}>
            <Form layout='inline'>
              <FormItem>
                <RadioGroup v-model:value={dateCheck.value} options={timeOptions} buttonStyle='solid' />
              </FormItem>
              <FormItem label='时间选择'>
                {dateCheck.value === 'YEAR' && <DatePicker v-model:value={yearPickerValue.value} picker='year' valueFormat='YYYY' format='YYYY' class={styles['input-item']} />}
                {dateCheck.value !== 'YEAR' && <DateRangePicker onChangePicker={handleChangePicker} v-model:value={rangePeriod.value} valueFormat={rangePickerFormat.value} picker={rangePicker.value} />}
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={handleSearch}>搜索</Button>
              </FormItem>
            </Form>
          </div>
          <div class={styles.content}>
            <ChartCard title='设备累计报警次数'>
              <PieChart value={state.deviceAlarmAmountsStatistics} legendPercents={false} seriesName='报警累计次数' unit='次' />
            </ChartCard>
            <ChartCard title='报警设备等级'>
              <PieChart value={state.deviceAlarmLevelsStatistics} legendPercents={false} seriesName='报警设备等级' />
            </ChartCard>
          </div>
          <div class={styles.title}>
            设备报警趋势
          </div>
          <div class={styles.chart}>
            <LineCharts unit='次' value={state.trendStatictics} seriesName={['报警次数']} xAxisData={state.trendChartPeriod} />
          </div>
          <div class={styles.table}>
            <Table pagination={false} columns={columns} size='small' dataSource={state.dataSource} />
            <div class={styles.page}>
              <GPagination
                current={state.searchParams.pageNumber}
                pageSize={state.searchParams.pageSize}
                total={state.searchParams.total ?? 0}
                onChange={changePage}
              />
              <GPagination
                current={state.searchParams.pageNumber}
                pageSize={state.searchParams.pageSize}
                total={state.searchParams.total ?? 0}
                onChange={changePage}
              />
            </div>
          </div>
        </div>
      </Spin>
    )
  }
})
