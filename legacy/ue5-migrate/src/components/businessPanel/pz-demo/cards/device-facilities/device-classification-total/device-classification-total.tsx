import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const DeviceClassificationTotal = defineComponent({
  setup () {
    // 设备分类数据
    const deviceData = ref([
      { name: '空调设备', value: 45, ratio: 25.0 },
      { name: '照明设备', value: 38, ratio: 21.1 },
      { name: '监控设备', value: 35, ratio: 19.4 },
      { name: '电梯设备', value: 28, ratio: 15.6 },
      { name: '门禁设备', value: 20, ratio: 11.1 },
      { name: '其他设备', value: 14, ratio: 7.8 }
    ])

    // 计算设备总数
    const totalDevices = ref(0)

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceCategoryCount({
        type: '',
        period: ''
      })
      totalDevices.value = result.reduce((total, item) => total + item.number, 0)
      deviceData.value = result.map(item=>{
        return {
          name: item.name,
          value: item.number,
          ratio: +((item.number / totalDevices.value) * 100).toFixed(2)
        }
      })
      initChart()
    }
    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const data = params[0]
            return `${data.name}<br/>
                    数量：${data.value}台<br/>
                    占比：${deviceData.value[data.dataIndex].ratio}%`
          }
        },
        grid: {
          left: '0%',
          right: '4%',
          top: '3%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
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
        yAxis: {
          type: 'category',
          data: deviceData.value.map(item => item.name),
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
        },
        series: [
          {
            type: 'bar',
            data: deviceData.value.map(item => ({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 1, color: '#3b82f6' },
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                ])
              }
            })),
            barWidth: '60%',
            label: {
              show: true,
              position: 'right',
              formatter: '{c}台',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title={`设备分类总数 (总数：${totalDevices.value}台)`}>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})