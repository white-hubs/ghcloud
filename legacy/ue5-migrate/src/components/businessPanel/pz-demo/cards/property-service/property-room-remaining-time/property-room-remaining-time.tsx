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

export const PropertyRoomRemainingTime = defineComponent({
  name: 'PropertyRoomRemainingTime',
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟会议室剩余时间数据
    const roomData = [
      { name: '会议室A', value: 0 }, // 单位：分钟
      { name: '会议室B', value: 0 },
      { name: '会议室C', value: 0 },
      { name: '会议室D', value: 0 }
    ]
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyMeetingRoomRemainingTime()
        if (res.length){
          roomData.length = 0
          for (let i = 0; i < res.length; i++){
            roomData.push({
              name: res[i].name,
              value: res[i].remaining
            })
          }
          totalRemainingTime.value = res.reduce((acc, cur) => acc + cur.remaining, 0)
        }
      } catch {

      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    // 计算总剩余时间
    const totalRemainingTime = ref(0)

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        title: {
          text: '总时间: ' + totalRemainingTime.value + ' 分钟',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(14)
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} 分钟 ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '剩余时间',
            type: 'pie',
            radius: ['30%', '50%'],
            avoidLabelOverlap: false,
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(30),
                fontWeight: 'bold'
              }
            },
            label: {
              show: true,
              formatter: '{b}',
              fontSize: calcFontSize(12),
              textStyle: {
                color: '#ffffff',
                fontsize: calcFontSize(12)
              }
            },
            data: roomData
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
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})