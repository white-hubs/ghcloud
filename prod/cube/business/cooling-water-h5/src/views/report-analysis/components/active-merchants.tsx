import { defineComponent, onMounted, ref } from 'vue'
import '../report-analysis.less'
import { DatePicker } from '@/components/data-picker'
import { Skeleton } from 'vant'
import { getActivityMerchant } from '@/api'
import type { ActivityState } from '@/api/index.i'
import { BarChart } from '@/components/charts/bar-chart'
import _ from 'lodash'
/** 活跃商户 */
export const ActiveMerchants = defineComponent({

  setup: () => {
    const loading = ref(false)
    const activeState = ref<ActivityState>({
      numberOfActive: 0,
      rateMerchantsQoq: 0,
      rateMerchantsYoy: 0,
      deviceNum: 0,
      rateDeviceQoq: 0,
      rateDeviceYoy: 0,
      yAxisOption: [{
        type: 'value',
        axisLabel: {
          color: '#A2A2A7'
        },
        splitLine: {
          show: true,
          color: '#f8f8f8',
          lineStyle: {
            type: 'dashed'
          },
        },
        boundaryGap: [0, 0.01]
      }],
      numberOfActiveMerchantsList: [],
      xTitle: [],
      numberOfActiveDeviceList: []
    })
    const monthPickerRef = ref<{ getValue: () => string; }>()
    onMounted(() => {
      getData()
    })

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          timeFlag: monthPickerRef.value?.getValue() ? `${monthPickerRef.value?.getValue()}-01` : ''
        }
        const { data } = await getActivityMerchant(params)
        const merchantListData = data.numberOfActiveMerchantsList
        const numberOfActiveDeviceList = data.numberOfActiveDeviceList
        const xAxisData = data.xTitle
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
            valueFormatter: function (value: string) {
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
            valueFormatter: function (value: string) {
              return value + '%'
            }
          },
          data: activeDeviceList.map(item => item.value)
        }]
        const yAxisOption = barSeries.map(item => {
          return {
            type: 'value',
            name: item.name,
            min: 0,
            max: () => {
              const value = item.data
              if (value.length) {
                return Math.max(...value)
              }
              return 1
            },
            splitLine: {
              show: true,
              color: '#f8f8f8',
              lineStyle: {
                type: 'dashed'
              },
            },
            boundaryGap: [0, 0.01],
            axisLabel: {
              formatter: `{value} ${item.name.includes('率') ? '%' : ''}`,
              color: '#A2A2A7'
            }
          }
        })
        activeState.value = { ...data, barSeries, yAxisOption }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    const onConfirm = (): void => {
      getData()
    }

    return () =>
      <div class='card'>
        <div class='card-title'>
          <div class='left merchants-title-left'>活跃商户</div>
          <DatePicker mode='month' ref={monthPickerRef} onConfirm={onConfirm} />
        </div>
        <div class='merchants-card'>
          <div class='item'>
            <Skeleton row='2' loading={loading.value}>
              <img src='./img/active-merchants-1.png' />
              <span class='merchants-card-title'>活跃用户(户)</span>
              <span class='merchants-card-value'>{activeState.value.numberOfActive}</span>
            </Skeleton>
          </div>
          <div class='item'>
            <Skeleton row='2' loading={loading.value}>
              <img src='./img/active-merchants-2.png' />
              <span class='merchants-card-title'>设备使用率</span>
              <span class='merchants-card-value'>{activeState.value.deviceNum}%</span>
            </Skeleton>
          </div>
        </div>
        <div class='chart'>
          <BarChart categoryData={activeState.value.xTitle} series={activeState.value.barSeries!} yAxisOptions={activeState.value.yAxisOption} />
        </div>
      </div>
  }
})
