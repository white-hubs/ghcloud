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

export const AssetOperation = defineComponent({
  name: 'AssetOperation',
  setup () {
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: 'THIS_WEEK',
    })

    // 模拟空间资产类型及其空置数量数据
    const assetData = [
      { name: '办公室', vacant: 10 },
      { name: '会议室', vacant: 20 },
      { name: '仓库', vacant: 30 },
      { name: '停车场', vacant: 40 }
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
            const data = assetData[params[0].dataIndex]
            return `${data.name}<br/>空置数量: ${data.vacant}`
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
          data: assetData.map(item => item.name),
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
          name: '空置数量',
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
            name: '空置数量',
            type: 'bar',
            data: assetData.map(item => item.vacant),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
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
        assetData[0].vacant = 10
        assetData[1].vacant = 20
        assetData[2].vacant = 30
        assetData[3].vacant = 40
      } else if (timeRange.value.timeType === 'THIS_MONTH') {
        assetData[0].vacant = 50
        assetData[1].vacant = 60
        assetData[2].vacant = 70
        assetData[3].vacant = 80
      } else if (timeRange.value.timeType === 'THIS_QUARTER') {
        assetData[0].vacant = 90
        assetData[1].vacant = 100
        assetData[2].vacant = 110
        assetData[3].vacant = 120
      } else if (timeRange.value.timeType === 'THIS_YEAR') {
        assetData[0].vacant = 130
        assetData[1].vacant = 140
        assetData[2].vacant = 150
        assetData[3].vacant = 160
      }
      chartResize()
    })

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "本季度", value: "THIS_QUARTER" },
            { label: "今年", value: "THIS_YEAR" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})