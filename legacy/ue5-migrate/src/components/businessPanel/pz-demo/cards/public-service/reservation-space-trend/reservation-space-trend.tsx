import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const ReservationSpaceTrend = defineComponent({
  name: 'ReservationSpaceTrend',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      series: [
        {
          name: '会议室',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210, 180, 160, 140, 190, 210],
          smooth: true
        },
        {
          name: '实验室',
          type: 'line',
          data: [220, 182, 191, 234, 290, 330, 310, 280, 260, 240, 290, 310],
          smooth: true
        }
      ]
    }

    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.public.getPublicSharedSpaceSpaceBookingTrend(getTimeRangeInterval(PeriodStatTypeEnum.THIS_MONTH))
        if (res.length !== 0) {
          chartData.xAxis = res.map(item => item.time)
          const areaData = []
          res.forEach(item => {
            item.areas.forEach(e=>{
              if (areaData.find(i=>i.area === e.area)){
                areaData.find(i=>i.area === e.area).count.push(e.count)
                return
              }
              areaData.push({
                area: e.area,
                count: [e.count]
              })
            })
          })
          chartData.series = areaData.map(item => ({
            name: item.area,
            type: 'line',
            data: item.count,
            smooth: true
          }))
        }
      } catch {

      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          data: ['会议室', '实验室'],
          right: 0,
          top: 0,
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(30)
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          type: 'category',
          data: chartData.xAxis,
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '预定人数',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: chartData.series.map(item => ({
          ...item,
          symbolSize: 8,
          lineStyle: {
            width: 3
          },
          itemStyle: {
            color: item.name === '会议室' ? '#5470c6' : '#91cc75'
          }
        })),
        dataZoom: [{
          type: 'slider',
          show: true,
          start: 0,
          end: 33,
          textStyle: {
            color: '#ffffff'
          }
        }]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})