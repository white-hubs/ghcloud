import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { cubeThirdConnectionService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { TreadListItem } from '@ghcloud/cube-third-connection-service'

use([
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const classTrendsAnalysis = defineComponent({
  name: 'classTrendsAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const resultData = ref<TreadListItem[]>([])
    const getData = async (): Promise<void> =>{
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview()
        resultData.value = res?.treadList ?? []
      } catch {
      }
    }
    const updateChart = async (): Promise<void> =>{
      await getData()
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }
      const currentData = {
        xData: resultData.value.map(item => item.year ?? ''),
        training: resultData.value.map(item => item.trainNumber ?? 0),
        class: resultData.value.map(item => item.classNumber ?? 0),
      }
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            let result = `${params[0].name}<br/>`
            params.forEach(param => {
              const colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>`
              if (param.seriesName === '培训人数') {
                result += `${colorSpan}培训人数：${param.value}个<br/>`
              } else if (param.seriesName === '班次总数') {
                result += `${colorSpan}班次总数：${param.value}次<br/>`
              }
            })
            return result
          }
        },
        legend: {
          data: ['培训人数', '班次总数'],
          right: '5%',
          top: '2%',
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          // 添加图例图标样式
          icon: 'circle',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          // 设置图例颜色
          inactiveColor: 'rgba(255, 255, 255, 0.3)',
          // 自定义图例颜色
          formatter: function(name) {
            return name
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(0),
          right: calcFontSize(20),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: currentData.xData,
          nameLocation: 'end',
          nameGap: calcFontSize(8),
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            margin: calcFontSize(12),
            interval: "auto",
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          name: '',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff',
              opacity: 0.3
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: '#ffffff',
              opacity: 0.1
            }
          },
          // 确保刻度线对齐数据
          alignTicks: true
        },
        series: [
          {
            name: '培训人数',
            type: 'line',
            smooth: true,
            showSymbol: false,
            emphasis: { 
              focus: "series",
            },
            data: currentData.training,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' }
              ])
            },
            lineStyle: {
              color: '#10b981',
            },
            itemStyle: {
              color: '#10b981'
            }
          },
          {
            name: '班次总数',
            type: 'line',
            smooth: true,
            showSymbol: false,
            emphasis: { 
              focus: "series",
            },
            data: currentData.class,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 1)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.2)' }
              ])
            },
            lineStyle: {
              color: 'rgba(59, 130, 246, 1)',
            },
            // 确保图例颜色与线条一致
            itemStyle: {
              color: 'rgba(59, 130, 246, 1)'
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
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
      <SubPanelTemplate title="近5年班次走势分析">
      <div class={['card-container-3']} >
        {resultData.value.length === 0 && <NoData />}
        <div ref={chartRef} style="width: 100%; height: 100%" ></div>
      </div>
      </SubPanelTemplate>
    )
  }
})