import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import styles from './parking-fee-analysis.module.less'
import { PZService } from '../../../card-service/service'
import { getAreaList } from '@/api/mdata'

use([
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// 定义API返回数据的类型
interface ChartDataItem {
  time: string
  count: number
}

export const ParkingFeeAnalysis = defineComponent({
  name: 'ParkingFeeAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })
    const selectedArea = ref()
    const chartData = ref<ChartDataItem[]>([])
    const loading = ref(false)

    // 停车区域数据
    const parkingAreas = ref([])

    const getAreaListData = async (): Promise<void> => {
      const res = await getAreaList()
      parkingAreas.value = res
      selectedArea.value = parkingAreas.value[0]?.id
    }

    const getData = async (): Promise<void> => {
      if (!selectedArea.value) return
      
      loading.value = true
      try {
        const result = await PZService.parking.getParkingFeeAnalysis({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(','),
          areaId: Array.isArray(selectedArea.value) ? selectedArea.value[selectedArea.value.length - 1] : selectedArea.value
        })
        
        chartData.value = result || []
        updateChart()
        
      } catch (error) {
        chartData.value = []
      } finally {
        loading.value = false
      }
    }

    const updateChart = (): void => {
      if (!chartInstance || chartData.value.length === 0) return

      const xData = chartData.value.map(item => item.time)
      const yData = chartData.value.map(item => item.count)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const time = params[0].name
            const value = params[0].value
            return `${time}<br/>费用：${value}元`
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(0),
          bottom: calcFontSize(30),
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            bottom: calcFontSize(5),
            height: calcFontSize(15),
            start: 0,
            end: timeRange.value.timeType === 'THIS_MONTH' ? 40 :
              timeRange.value.timeType === 'THIS_YEAR' ? 100 :
                timeRange.value.timeType === 'TODAY' ? 50 : 100,
            zoomLock: false,
            brushSelect: false,
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4,4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '110%',
            handleStyle: {
              color: '#3b82f6',
              borderColor: '#3b82f6',
              borderWidth: 1
            },
            moveHandleStyle: {
              color: '#3b82f6'
            },
            fillerColor: 'rgba(59, 130, 246, 0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: 'transparent',
            textStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(10)
            },
            emphasis: {
              handleStyle: {
                color: '#60a5fa',
                borderColor: '#60a5fa'
              }
            }
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 50,
            zoomOnMouseWheel: 'shift',
            moveOnMouseMove: true
          }
        ],
        xAxis: {
          type: 'category',
          data: xData,
          name: timeRange.value.timeType === 'THIS_MONTH' ? '月' :
            timeRange.value.timeType === 'THIS_YEAR' ? '年' : '',
          nameLocation: 'end',
          nameGap: 5,
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            align: 'right'
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: 0,
            margin: calcFontSize(8),
            align: 'center',
            formatter: (value): string => {
              return value
            }
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
            length: calcFontSize(3)
          }
        },
        yAxis: {
          type: 'value',
          name: '金额(元)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(30)]
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: calcFontSize(8)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: [
          {
            name: '停车费用',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: yData,
            itemStyle: {
              color: '#3b82f6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0.1)'
                }
              ])
            },
            lineStyle: {
              width: 3,
              color: '#3b82f6'
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        getData()
      }
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(async () => {
      await getAreaListData()
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    watch([() => timeRange.value.timeType, () => selectedArea.value], getData)

    return (): JSX.Element => (
      <SubPanelTemplate title='停车费用分析' v-slots={{
        extra: () => (
          <div class={styles.fee}>
            <DateInlineForm v-model:modelValue={timeRange.value} ></DateInlineForm>
            <a-cascader
              change-on-select
              v-model:value={selectedArea.value}
              class={styles.area}
              placeholder="区域"
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              options={parkingAreas.value}
              popupClassName={styles.myArea}
              getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
              allowClear={false}
            />
          </div>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})