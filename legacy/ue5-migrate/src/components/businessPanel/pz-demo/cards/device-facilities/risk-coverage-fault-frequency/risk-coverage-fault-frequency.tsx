import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { PZService } from '../../../card-service/service'

use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const RiskCoverageFaultFrequency = defineComponent({
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_WEEK',
      dateRange: [],
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceFaultFrequency({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const xAxis = result.map((item) => item.time)
      const series = result.map((item) => item.count)
      updateChart({ xAxis, series })
      // faultData = result.map((item, index)=>{
      //   return {
      //     name: item.name,
      //     value: item.number,
      //     itemStyle: { color: colors[index] }
      //   }
      // })
      // initChart()
    }
    // 模拟数据生成函数
    // const generateData = (timeType) => {
    //   const data = {
    //     THIS_WEEK: {
    //       xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    //       series: [4, 6, 3, 7, 5, 2, 4]
    //     },
    //     THIS_MONTH: {
    //       xAxis: ['第1周', '第2周', '第3周', '第4周'],
    //       series: [18, 22, 15, 20]
    //     },
    //     THIS_QUARTER: {
    //       xAxis: ['1月', '2月', '3月'],
    //       series: [65, 58, 70]
    //     },
    //     THIS_YEAR: {
    //       xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    //       series: [45, 52, 48, 55, 42, 38, 50, 45, 56, 48, 52, 45]
    //     }
    //   }
    //   return data[timeType]
    // }

    // 更新图表
    const updateChart = (chartData: {
      xAxis: string[];
      series: number[];
    }): void => {
      if (!chartInstance) return

      // const chartData = generateData(timeRange.value.timeType)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: '#3B82F6',
              width: 1,
              type: 'dashed'
            }
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(30), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: chartData.xAxis,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '故障频率(次)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '故障频率',
            type: 'line',
            data: chartData.series,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#3B82F6'
            },
            lineStyle: {
              width: 3,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [{
                  offset: 0,
                  color: '#3B82F6'
                }, {
                  offset: 1,
                  color: '#60A5FA'
                }]
              }
            },
            areaStyle: {
              opacity: 0.2,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: '#3B82F6'
                }, {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0)'
                }]
              }
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    // // 监听时间范围变化
    // watch(() => timeRange.value.timeType, () => {
    //   updateChart()
    // })

    onMounted(() => {
      chartInstance = echarts.init(chartRef.value)
      // updateChart()
      // getData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="故障频率趋势"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
              onSearch={getData}
            />
          )
        }}
      >
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})