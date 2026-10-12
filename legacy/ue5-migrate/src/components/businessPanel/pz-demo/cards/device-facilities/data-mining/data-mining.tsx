import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { ScatterChart } from 'echarts/charts'
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
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const DataMining = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 模拟设备数据
    // const generateDeviceData = (): unknown[] => {
    //   const devices = []
    //   const deviceTypes = ['空调设备', '照明设备', '监控设备', '电梯设备', '门禁设备']

    //   deviceTypes.forEach(type => {
    //     // 为每种类型生成多个设备数据点
    //     for (let i = 1; i <= 10; i++) {
    //       const runningTime = Math.floor(Math.random() * 1000) + 500 // 500-1500小时
    //       const faultRate = (Math.random() * 5 + 1).toFixed(2) // 1-6%
    //       devices.push({
    //         name: `${type}-${i}号`,
    //         value: [runningTime, faultRate],
    //         deviceType: type
    //       })
    //     }
    //   })
    //   return devices
    // }
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceAnalysisMining({
        type: '',
        period: ''
      })
      const devices = result.map(item=>{
        return {
          name: item.name,
          value: [+item.runTime, +item.failureRate.replace('%', '')],
          deviceType: item.typeName
        }
      })

      initChart(devices)

    }
    // 随机生成颜色
    const randomColor = (): string => {
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)
      const b = Math.floor(Math.random() * 256)
      return `rgb(${r},${g},${b})`
    }
    // 初始化图表
    const initChart = (deviceData: {
      name: string;
      value: number[];
      deviceType: string;
    }[]): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const uniqueTypes = Array.from(new Set(deviceData.map(item => item.deviceType)));
      const series = uniqueTypes.map((type) => {
        return {
          name: type,
          type: 'scatter',
          data: deviceData.filter(item => item.deviceType === type),
          symbolSize: 10,
          itemStyle: {
            // 随机生成颜色
            color: randomColor()
          }
        }
      })
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            return `设备：${params.data.name}<br/>
                    运行时间：${params.data.value[0]}小时<br/>
                    故障率：${params.data.value[1]}%`
          }
        },
        legend: {
          data: uniqueTypes,
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          top: 0
        },
        grid: {
          top: calcFontSize(80),
          left: calcFontSize(10),
          right: calcFontSize(20),
          bottom: calcFontSize(10), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '运行时间(小时)',
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
        yAxis: {
          type: 'value',
          name: '故障率(%)',
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
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
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series
        // series: [
        //   {
        //     name: '空调设备',
        //     type: 'scatter',
        //     data: deviceData.filter(item => item.deviceType === '空调设备'),
        //     symbolSize: 12,
        //     itemStyle: {
        //       color: '#3B82F6'
        //     }
        //   },
        //   {
        //     name: '照明设备',
        //     type: 'scatter',
        //     data: deviceData.filter(item => item.deviceType === '照明设备'),
        //     symbolSize: 12,
        //     itemStyle: {
        //       color: '#10B981'
        //     }
        //   },
        //   {
        //     name: '监控设备',
        //     type: 'scatter',
        //     data: deviceData.filter(item => item.deviceType === '监控设备'),
        //     symbolSize: 12,
        //     itemStyle: {
        //       color: '#F59E0B'
        //     }
        //   },
        //   {
        //     name: '电梯设备',
        //     type: 'scatter',
        //     data: deviceData.filter(item => item.deviceType === '电梯设备'),
        //     symbolSize: 12,
        //     itemStyle: {
        //       color: '#8B5CF6'
        //     }
        //   },
        //   {
        //     name: '门禁设备',
        //     type: 'scatter',
        //     data: deviceData.filter(item => item.deviceType === '门禁设备'),
        //     symbolSize: 12,
        //     itemStyle: {
        //       color: '#EC4899'
        //     }
        //   }
        // ]
      }
      chartInstance.setOption(option)
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="设备故障率分析">
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})