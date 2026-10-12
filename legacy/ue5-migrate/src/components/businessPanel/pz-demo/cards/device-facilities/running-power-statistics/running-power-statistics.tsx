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
import styles from './running-power-statistics.module.less'
import { PZService } from '../../../card-service/service'


use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const RunningPowerStatistics = defineComponent({
  setup () {
    // 时间范围选择
  // 时间范围选择
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })


    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    // 模拟数据
    const handleChangeTime = async (): Promise<void> => {
      const result = await PZService.device.getDeviceRunPowerStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const xAxis = result.map(item => item.time)
      const types = []
      result.forEach(item=>{
        item.types.forEach(item=>{
          if (!types.includes(item.type)){
            types.push(item.type)
          }
        })
      })
      const series = types.map(type=>{
        return {
          name: type,
          data: result.map(item=>{
            const itemType = item.types.find(item=>item.type === type)
            return itemType ? itemType.count : 0
          })
        }
      })
      updateChart({
        xAxis,
        series
      })
    }
    // 更新图表
    const updateChart = (chartData: {
      xAxis: string[];
      series: {
        name: string;
        data: number;
      }[];
    }): void => {
      if (!chartInstance) return
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params): string => {
            let result = params[0].axisValue + '<br/>'
            params.forEach(item => {
              result += `${item.marker} ${item.seriesName}: ${item.value} kW<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['空调设备', '照明设备', '监控设备'],
          textStyle: {
            color: '#ffffff'
          },
          top: 0
        },
        grid: {
          top: calcFontSize(60),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(0), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: chartData.xAxis,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '功率(kW)',
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
        series: chartData.series.map(item => ({
          name: item.name,
          type: 'line',
          smooth: true,
          data: item.data,
          showSymbol: false,
          lineStyle: {
            width: 2
          },
          areaStyle: {
            opacity: 0.1
          }
        }))
      }
      chartInstance.setOption(option)
    }

    // 监听时间范围变化
    // watch(() => timeRange.value.timeType, () => {
    //   updateChart()
    // })

    onMounted(() => {
      chartInstance = echarts.init(chartRef.value)
      // updateChart()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="设备运行功率统计"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
              onSearch={handleChangeTime}
            />
          )
        }}
      >
        <div class={styles.container} ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})