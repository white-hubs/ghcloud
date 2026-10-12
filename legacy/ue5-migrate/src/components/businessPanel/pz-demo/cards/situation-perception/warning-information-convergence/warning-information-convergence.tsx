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

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const WarningInformationConvergence = defineComponent({
  name: 'WarningInformationConvergence',
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_WEEK',
    })

    // 模拟预警类型及其数量数据
    const warningData = [
      { name: '火灾预警', count: 10 },
      { name: '入侵预警', count: 20 },
      { name: '设备故障', count: 30 },
      { name: '环境异常', count: 40 }
    ]

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const data = warningData[params[0].dataIndex]
            return `${data.name}<br/>预警数量: ${data.count}`
          },
          textStyle: {
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
          type: 'category',
          data: warningData.map(item => item.name),
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          name: '预警数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          min: 0
        },
        series: [
          {
            name: '预警数量',
            type: 'bar',
            data: warningData.map(item => item.count),
            itemStyle: {
              // 修改柱状体颜色为顶部蓝色，渐变到底部透明
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#007BFF' },
                { offset: 1, color: 'rgba(0, 123, 255, 0)' }
              ])
            },
            barWidth: '60%'
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
        initChart(chartRef.value as HTMLElement)
      }
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', chartResize)
      chartInstance?.dispose()
    })

    watch(() => timeRange.value.timeType, () => {
      if (timeRange.value.timeType === 'THIS_WEEK') {
        warningData[0].count = 10
        warningData[1].count = 20
        warningData[2].count = 30
        warningData[3].count = 40
      } else if (timeRange.value.timeType === 'THIS_MONTH') {
        warningData[0].count = 50
        warningData[1].count = 60
        warningData[2].count = 70
        warningData[3].count = 80
      } else if (timeRange.value.timeType === 'THIS_YEAR') {
        warningData[0].count = 90
        warningData[1].count = 100
        warningData[2].count = 110
        warningData[3].count = 120
      }
      chartResize()
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
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