import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRoomDeviceStatus = defineComponent({
  name: 'PropertyRoomDeviceStatus',
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟设备状态数据
    const deviceData = [
      { value: 0, name: '在线' },
      { value: 0, name: '离线' }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyMeetingRoomDeviceStatus()
      if (res.length){
        deviceData.length = 0
        res.forEach(item => {
          deviceData.push({
            value: item.count,
            name: item.name
          })
        })
      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }


    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} 台 ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: deviceData.map(item => item.name),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '设备状态',
            type: 'pie',
            radius: '40%',
            center: ['50%', '60%'],
            data: deviceData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              textStyle: {
                fontSize: calcFontSize(12),
                color: '#ffffff'
              }
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 20,
              lineStyle: {
                color: '#ffffff'
              }
            }
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        if (chartRef.value) {
          initChart(chartRef.value as HTMLElement)
        }
      }, 1000)
    }

    onMounted(() => {
      if (chartRef.value) {
        getData()
      }
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.dispose()
      }
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})