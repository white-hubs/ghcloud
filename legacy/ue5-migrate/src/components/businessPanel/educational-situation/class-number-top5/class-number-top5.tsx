import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { calcFontSize } from '@/utils/common'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { cubeThirdConnectionService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const classNumberTop5 = defineComponent({
  name: 'classNumberTop5',
  setup () {
    const resultData = ref<{name: string, value: number, ratio: number}[]>([])
    const totalNum = ref(0)
    let chartInstance = null
    const chartRef = ref(null)
    const getData = async (): Promise<void>=>{
      const res = await cubeThirdConnectionService.getEducationalDataOverview()
      const sortData = (res?.classTopList ?? []).sort((a, b) => b.value - a.value)
      totalNum.value = (res?.classTopList ?? []).reduce((total, item) => total + item.value, 0)
      resultData.value = sortData.map(item=>{
        return {
          name: item.name,
          value: item.value,
          ratio: +((item.value / totalNum.value) * 100).toFixed(2)
        }
      })
    }

    const updateChart = async (): Promise<void> => {
      await getData()
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const data = params[0]
            return `<div style="display:flex;align-items:center;">
              <span>${data.name}</span>
            </div>
            人数：${data.value}个<br/>
            占比：${resultData.value[data.dataIndex].ratio}%`
          }
        },
        grid: {
          left: '0%',
          right: '20%',
          top: calcFontSize(10),
          bottom: calcFontSize(0),
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
          data: resultData.value?.map(item => item.name),
          inverse: true, 
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
            data: resultData.value.map(item => ({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
                ])
              }
            })),
            barWidth: resultData.value.length > 3 ? calcFontSize(20) : calcFontSize(30),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}个',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              distance: 5,
              overflow: 'truncate'
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }
    const handleResize = () => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        initChart()
      }, 1000);
    }
    onMounted(async () => {
      await nextTick()
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="班级人数top5">
        <div class={['card-container-3']} >
          {resultData.value.length === 0 && <NoData />}
          <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})