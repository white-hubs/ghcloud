import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { GLayout } from '@/components/common/layout'
import styles from './report-analysis.module.less'
import { DatePicker, RadioGroup, DateRangePicker, Input, Select, type PickerMode, Button, Spin } from '@ghcloud/cube-ui'
import { AnalysisCard } from './components/analysis-card'
import { BarCharts } from '@/components/chart/bar-charts'
import { getLocalAssetsFile } from '@/utils/common'
import { LineCharts } from '@/components/chart/line-charts'
import { getDeviceAllStatistic, getDeviceBasicStatistic, getActivityMerchant, getElectricityRate } from '@/api/merchant-managent'
import { getDeptOption } from '@/api'
import { LinesCharts } from '@/components/chart/lines-charts'
import dayjs from 'dayjs'
import _ from 'lodash'
const dateFormat = 'YYYY-MM-DD'
const monthFormat = 'YYYY-MM'
export const ReportAnalysis = defineComponent({
  setup: () => {
    const state = reactive<{
      deptOption: unknown[];
      basicStatistic: Record<string, number>;
      activityStatistic: Record<string, unknown>;
      allStatistic: Record<string, unknown>;
      activityTimeValue: string;
      allSearchParams: Record<string, unknown>;
      electricSticistic: number;
      loading: boolean;
      electricSticisticPeriod: string[];
    }>({
      deptOption: [],
      basicStatistic: {},
      activityStatistic: {},
      allStatistic: {},
      loading: false,
      allSearchParams: {
        timeType: 'TODAY',
        department: null,
        gearPositionCode: '',
        deviceCode: '',
        code: '',
        shiftMaster: '',
      },
      activityTimeValue: dayjs().format('YYYY-MM'),
      electricSticistic: 0,
      electricSticisticPeriod: [dayjs().format('YYYY-MM-01'), dayjs().format('YYYY-MM-DD')]
    })
    const downImage = getLocalAssetsFile('down.png')
    const upImage = getLocalAssetsFile('rise.png')
    // 获取统计数据
    const getStatistics = async (): Promise<void> => {
      let startTime = ''
      let endTime = ''
      if (state.allSearchParams.timeType === 'Year') {
        startTime = `${yearDateValue.value}-01-01`
      } else if (state.allSearchParams.timeType === 'Month') {
        startTime = periodValue.value ? dayjs(periodValue.value[0]).format('YYYY-MM-01') : ''
        endTime = periodValue.value ? dayjs(periodValue.value[1]).format('YYYY-MM-DD') : ''
      } else {
        startTime = periodValue.value ? dayjs(periodValue.value[0]).format('YYYY-MM-DD') : ''
        endTime = periodValue.value ? dayjs(periodValue.value[1]).format('YYYY-MM-DD') : ''
      }

      const params = {
        ...state.allSearchParams,
        startTime,
        endTime
      }
      const { data } = await getDeviceAllStatistic(params)
      state.allStatistic = data
      const durationTrendData = data.durationTrend as { keyName: string; value: number; }[]
      const flowTrendData = data.flowTrend as { keyName: string; value: number; }[]
      const costTrendData = data.costTrend as { keyName: string; value: number; }[]
      const xAxisData = data.xtitle as string[]
      const initDataList = xAxisData.map(item => {
        return {
          keyName: item,
          value: 0
        }
      })
      const durationTrendList = _.unionBy(durationTrendData, initDataList, 'keyName')
      durationTrendList.sort((a, b) => {
        const time1 = new Date(a.keyName).getTime()
        const time2 = new Date(b.keyName).getTime()
        return time1 - time2
      })
      const flowTrendList = _.unionBy(flowTrendData, initDataList, 'keyName')
      flowTrendList.sort((a, b) => {
        const time1 = new Date(a.keyName).getTime()
        const time2 = new Date(b.keyName).getTime()
        return time1 - time2
      })
      const costTrendList = _.unionBy(costTrendData, initDataList, 'keyName')
      costTrendList.sort((a, b) => {
        const time1 = new Date(a.keyName).getTime()
        const time2 = new Date(b.keyName).getTime()
        return time1 - time2
      })
      const barSeries = [{
        name: '运行时长',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        yAxisIndex: 0,
        showSymbol: false,
        symbol: 'circle',
        tooltip: {
          valueFormatter: function (value: string): string {
            return value + 'h'
          }
        },
        data: durationTrendList.map(item => item.value)
      },
      {
        name: '冷媒流量',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        yAxisIndex: 1,
        showSymbol: false,
        symbol: 'circle',
        tooltip: {
          valueFormatter: function (value: string): string {
            return value + 'm³/h'
          }
        },
        data: flowTrendList.map(item => item.value)
      }]
      const yAxisOption = barSeries.map(item => {
        return {
          type: 'value',
          name: item.name,
          min: 0,
          max: (): number => {
            const value = item.data
            if (value.length) {
              return Math.max(...value)
            }
            return 1
          },
          axisLabel: {
            formatter: `{value} ${item.name.includes('时长') ? 'h' : 'm³/h'}`
          }
        }
      })
      state.allStatistic.barSeries = barSeries
      state.allStatistic.yAxisOption = yAxisOption
      state.allStatistic.lineChartValue = costTrendList.map(item => item.value)
    }
    // 搜索
    const handleSearch = (): void => {
      getStatistics()
    }
    // 获取基础数据
    const getBasicStatistics = async (): Promise<void> => {
      const { data } = await getDeviceBasicStatistic()
      state.basicStatistic = data
    }
    // 获取活跃商户数据
    const getActiveityStatistics = async (): Promise<void> => {
      const params = {
        timeFlag: `${state.activityTimeValue}-01`
      }
      const { data } = await getActivityMerchant(params)
      state.activityStatistic = data
      const merchantListData = data.numberOfActiveMerchantsList as { keyName: string; value: number; }[]
      const numberOfActiveDeviceList = data.numberOfActiveDeviceList as { keyName: string; value: number; }[]
      const xAxisData = data.xTitle as string[]
      const initDataList = xAxisData.map(item => {
        return {
          keyName: item,
          value: 0
        }
      })
      const activeDeviceList = _.unionBy(numberOfActiveDeviceList, initDataList, 'keyName')
      activeDeviceList.sort((a, b) => {
        const time1 = new Date(a.keyName).getTime()
        const time2 = new Date(b.keyName).getTime()
        return time1 - time2
      })
      const merchantList = _.unionBy(merchantListData, initDataList, 'keyName')
      merchantList.sort((a, b) => {
        const time1 = new Date(a.keyName).getTime()
        const time2 = new Date(b.keyName).getTime()
        return time1 - time2
      })
      const barSeries = [{
        name: '商户',
        type: 'bar',
        barWidth: 10,
        yAxisIndex: 0,
        tooltip: {
          valueFormatter: function (value: string): string {
            return value + '（户）'
          }
        },
        data: merchantList.map(item => item.value)
      },
      {
        name: '设备活跃率',
        type: 'bar',
        barWidth: 10,
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: function (value: string): string {
            return value + '%'
          }
        },
        data: activeDeviceList.map(item => item.value)
      }]
      const yAxisOption = barSeries.map(item => {
        const itemMax = Math.floor(Math.max(...item.data))
        return {
          type: 'value',
          name: item.name,
          min: 0,
          max: itemMax,
          axisLabel: {
            formatter: `{value} ${item.name.includes('率') ? '%' : ''}`
          }
        }
      })
      state.activityStatistic = data
      state.activityStatistic.barSeries = barSeries
      state.activityStatistic.yAxisOption = yAxisOption
    }
    const handleActivityDateChange = (): void => {
      getActiveityStatistics()
    }
    // 获取耗电数据
    const getElectricityRateData = async (): Promise<void> => {
      const params = {
        startTime: state.electricSticisticPeriod[0],
        endTime: state.electricSticisticPeriod[1]
      }
      const { data } = await getElectricityRate(params)
      state.electricSticistic = data.coldWaterElectricity as number
    }

    const handlePickerChange = (): void => {
      getElectricityRateData()
    }
    const getDeptOptions = async (): Promise<void> => {
      const { data } = await getDeptOption()
      state.deptOption = data
    }
    onMounted(async () => {
      try {
        state.loading = true
        await getDeptOptions()
        await getStatistics()
        await getActiveityStatistics()
        await getBasicStatistics()
        await getElectricityRateData()
      } catch {
      } finally {
        state.loading = false
      }
    })
    const activeMerchantCard = (imgSrc: string, label: string, field: string): JSX.Element => {
      const iconSrc = getLocalAssetsFile(imgSrc)
      return (
        <div class={styles.card}>
          <div class={styles['card-info']}>
            <span>{label}</span>
            <span class={styles.count}>{state.activityStatistic[field]}{field === 'deviceNum' ? '%' : ''}</span>
          </div>
          <img src={iconSrc} alt='' srcset='' />
        </div>
      )
    }
    const footerContentItem = (title: string, valueFiled: string, yoyRatioField: string, qoqRatioField: string): JSX.Element => {
      const qoqValue = state.allStatistic[qoqRatioField] as number
      const yoyValue = state.allStatistic[yoyRatioField] as number
      let qoqIcon = ''
      let yoyIcon = ''
      if (qoqValue > 0) {
        qoqIcon = upImage
      }
      if (qoqValue < 0) {
        qoqIcon = downImage
      }
      if (yoyValue > 0) {
        yoyIcon = upImage
      }
      if (yoyValue < 0) {
        yoyIcon = downImage
      }
      return (
        <div class={styles['content-item']}>
          <div>{title}</div>
          <div class={styles['content-value']}>
            <span class={styles['content-count']}>{state.allStatistic[valueFiled] ?? '00'}</span>
            <div class={styles.ratio}>
              <div class={styles['ratio-value']}>
                <span>环比</span>
                <div class={[styles.value, qoqValue > 0 && styles.up, qoqValue < 0 && styles.down]}>
                  {qoqValue !== 0 && <img src={qoqIcon} alt='' />}
                  <span>{Math.abs(qoqValue) || '0'}%</span>
                </div>
              </div>
              <div class={styles['ratio-value']}>
                <span>同比</span>
                <div class={[styles.value, yoyValue > 0 && styles.up, yoyValue < 0 && styles.down]}>
                  {yoyValue !== 0 && <img src={yoyIcon} alt='' />}
                  <span>{Math.abs(yoyValue) || '0'}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    const timeOptions = [
      { label: '年', value: 'Year' },
      { label: '月', value: 'Month' },
      { label: '日', value: 'TODAY' }
    ]
    const periodValue = ref<string[]>([dayjs().format('YYYY-MM-DD 00:00:01'), dayjs().format('YYYY-MM-DD 23:59:59')])
    const yearDateValue = ref<string>(dayjs().format('YYYY'))
    const handleChangePicker = (value: string[]): void => {
      periodValue.value = value
    }
    watch(() => state.allSearchParams.timeType, () => {
      if (state.allSearchParams.timeType === 'TODAY') {
        periodValue.value = [dayjs().format('YYYY-MM-DD 00:00:01'), dayjs().format('YYYY-MM-DD 23:59:59')]
      }
      if (state.allSearchParams.timeType === 'Month') {
        periodValue.value = [dayjs().format('YYYY-MM'), dayjs().format('YYYY-MM')]
      }
      if (state.allSearchParams.timeType !== 'Year') {
        yearDateValue.value = dayjs().format('YYYY')
      }
    })
    const rangePickerFormat = computed(() => {
      const pickerFormatMap = new Map([['Month', monthFormat], ['TODAY', dateFormat]])
      return pickerFormatMap.get(state.allSearchParams.timeType as string) ?? monthFormat
    })
    const picker = computed(() => {
      const pickerType: Record<string, PickerMode> = {
        Month: 'month',
        TODAY: 'date'
      }
      return pickerType[state.allSearchParams.timeType as string] ?? 'date'
    })
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <Spin spinning={state.loading}>
            <>
              <div class={styles['card-container']}>
                {/* 档位总数 */}
                <AnalysisCard
                  imageSrc='gear_count.png'
                  value={state.basicStatistic.gearPosition}
                  title='冷冻水档位总数（个）'
                />
                <AnalysisCard
                  imageSrc='merchant_count.png'
                  value={state.basicStatistic.wholesaler}
                  title='冷冻水商户总数（户）'
                />
                <AnalysisCard
                  imageSrc='gear_count.png'
                  showPicker
                  title='冷冻水耗电（kW·h）'
                  onPickerChange={handlePickerChange}
                  v-model:pickerValue={state.electricSticisticPeriod}
                  value={state.electricSticistic}
                />
              </div>
              <div class={styles['active-merchant']}>
                <div class={styles.top}>
                  <div class={styles.title}>
                    <div class={styles.name}>活跃商户</div>
                    <div class={styles.tips}>月使用时长超过24小时商户</div>
                  </div>
                  <DatePicker picker='month' format='YYYY-MM' valueFormat='YYYY-MM' v-model:value={state.activityTimeValue} style={{ width: '200px' }} onChange={handleActivityDateChange} />
                </div>
                <div class={styles.middle}>
                  {activeMerchantCard('count_icon.png', '商户数量（户）：', 'numberOfActive')}
                  {activeMerchantCard('active_rate.png', '设备活跃率：', 'deviceNum')}
                </div>
                <div style={{ height: '250px', marginTop: '20px' }}>
                  <BarCharts
                    xAxisData={state.activityStatistic.xTitle as string[]}
                    yAxisOption={state.activityStatistic.yAxisOption as unknown[]}
                    series={state.activityStatistic.barSeries as unknown[]}
                  />
                </div>
              </div>
              <div class={styles.footer}>
                <div class={styles.top}>
                  <div class={styles['search-bar']}>
                    <RadioGroup class={styles['radio-item']} v-model:value={state.allSearchParams.timeType} options={timeOptions} buttonStyle='solid' />
                    {state.allSearchParams.timeType === 'Year' && <DatePicker v-model:value={yearDateValue.value} class={styles['picker-item']} valueFormat='YYYY' picker='year' placeholder='请选择' />}
                    {['Month', 'TODAY'].includes(state.allSearchParams.timeType as string) && <DateRangePicker class={styles['picker-item']} onChangePicker={handleChangePicker} picker={picker.value} valueFormat={rangePickerFormat.value} v-model:value={periodValue.value} />}
                    <Select options={state.deptOption} placeholder='管理部门' v-model:value={state.allSearchParams.department} class={styles['input-item']} fieldNames={{ label: 'name', value: 'id' }} allowClear />
                    <Input class={styles['input-item']} placeholder='档位号' v-model:value={state.allSearchParams.gearPositionCode} />
                    <Input class={styles['input-item']} placeholder='档主姓名' v-model:value={state.allSearchParams.shiftMaster} />
                    <Input class={styles['input-item']} placeholder='档主编号' v-model:value={state.allSearchParams.code} />
                    <Input class={styles['input-item']} placeholder='钛泡编号' v-model:value={state.allSearchParams.deviceCode} />
                    <Button type='primary' onClick={handleSearch}>查询</Button>
                  </div>
                </div>
                <div class={styles.content}>
                  {footerContentItem('累计费用（元）', 'costTotal', 'costRateYoy', 'costRateQoq')}
                  {footerContentItem('累计运行时长（小时）', 'duration', 'durationRateYoy', 'durationRateQoq')}
                  {footerContentItem('冷媒累计流量', 'flow', 'flowRateYoy', 'flowRateQoq')}
                </div>
                <div class={styles['trend-charts']}>
                  <div class={styles['chart-title']}>
                    冷冻水使用趋势
                  </div>
                  <div style={{ height: '250px', marginTop: '20px' }}>
                    <LinesCharts
                      xAxisData={state.allStatistic.xtitle as string[]}
                      yAxisOption={state.allStatistic.yAxisOption as unknown[]}
                      series={state.allStatistic.barSeries as unknown[]}
                    />
                  </div>
                  <div class={styles['chart-title']} style={{ marginTop: '20px' }}>
                    费用趋势
                  </div>
                  <div style={{ height: '250px', marginTop: '20px' }}>
                    <LineCharts seriesName={['费用']} xAxisData={state.allStatistic.xtitle as string[]} value={state.allStatistic.lineChartValue as string[]} />
                  </div>
                </div>
              </div>
            </>
          </Spin>

        )
      }
    }
    return (): JSX.Element => (
      <div class={styles['report-analysis']}><GLayout title='报表分析' v-slots={layoutSlots} showSearch={false} /></div>
    )
  }
})
