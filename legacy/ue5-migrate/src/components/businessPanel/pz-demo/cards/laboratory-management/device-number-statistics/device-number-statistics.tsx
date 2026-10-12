import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const DeviceNumberStatistics = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const statType = ref({
      timeType: 'SPACE'
    })
    const getData = async (): Promise<void> => {
      const res = await PZService.laboratory.getDeviceCountStatistics(statType.value.timeType === 'SPACE' ? 1 : 2)
      chartData.xAxis = res.map(item => item.deviceName)
      chartData.series = res.map(item => item.count)
      initChart(chartRef.value as HTMLElement)
    }

    // 模拟数据
    const chartData = {
      xAxis: ['实验室A', '实验室B', '实验室C', '实验室D'],
      series: [50, 45, 60, 55]
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      const data = chartData
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
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(22)
        },
        xAxis: {
          type: 'category',
          data: data.xAxis,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: 0
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '数量(台)',
          nameTextStyle: {
            fontSize: calcFontSize(12) // 设置name的字体大小，使用calcFontSize函数计算
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
        series: [{
          name: '设备数量',
          type: 'bar',
          data: data.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }],
        dataZoom: chartData.xAxis.length > 5 ? [
          {
            type: 'slider',
            start: 0,
            end: 53
          },
        ] : []
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

    watch(() => statType.value.timeType, () => {
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <>
            <DateInlineForm v-model:modelValue={statType.value} timeList={[
              { label: "空间", value: "SPACE" },
              { label: "分类", value: "CATEGORY" }
            ]}></DateInlineForm>
          </>
        )
      }}>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})