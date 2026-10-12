import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
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
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const DeviceRunStatusHistory = defineComponent({
  name: 'DeviceRunStatusHistory',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_WEEK',
    })
    const chartData = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      online: [120, 125, 130, 128, 135, 120, 115],
      offline: [5, 3, 2, 4, 1, 2, 3]
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          data: ['在线设备', '离线设备'],
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(50),
          bottom: calcFontSize(30)
        },
        xAxis: {
          type: 'category',
          data: chartData.xAxis,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '设备数量',
          nameTextStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        series: [
          {
            name: '在线设备',
            type: 'line',
            smooth: true,
            data: chartData.online,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
              ])
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
              ])
            }
          },
          {
            name: '离线设备',
            type: 'line',
            smooth: true,
            data: chartData.offline,
            itemStyle: {
              color: '#ee6666'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(238, 102, 102, 0.5)' },
                { offset: 1, color: 'rgba(238, 102, 102, 0.1)' }
              ])
            }
          }
        ]
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(() => {
      chartRef.value && initChart(chartRef.value as HTMLElement)
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    watch(()=>timeRange.value.timeType, ()=>{
      if (timeRange.value.timeType === 'THIS_WEEK'){
        chartData.xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        chartData.online = [120, 125, 130, 128, 135, 120, 115]
        chartData.offline = [5, 3, 2, 4, 1, 2, 3]
      } else if (timeRange.value.timeType === 'THIS_MONTH'){
        chartData.xAxis = ['第一周', '第二周', '第三周', '第四周']
        chartData.online = [500, 520, 510, 530]
        chartData.offline = [15, 10, 12, 8]
      } else if (timeRange.value.timeType === 'THIS_YEAR'){
        chartData.xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
        chartData.online = [1500, 1600, 1550, 1650]
        chartData.offline = [45, 30, 35, 25]
      }
      chartResize()
    })


    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} 
          timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})