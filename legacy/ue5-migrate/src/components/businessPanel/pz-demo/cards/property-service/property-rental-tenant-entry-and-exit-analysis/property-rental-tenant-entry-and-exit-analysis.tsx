import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { getTimeRangeInterval, PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent
])

export const PropertyRentalTenantEntryAndExitAnalysis = defineComponent({
  name: 'PropertyRentalTenantEntryAndExitAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const timeRange = ref({
      timeType: PeriodStatTypeEnum.THIS_MONTH,
    })
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyRentAnalysisLease(getTimeRangeInterval(timeRange.value.timeType), timeRange.value.timeType)
        currentData.value = {
          xAxis: res.map(item => item.time),
          entry: res.map(item => item.count),
          exit: res.map(item => item.count2),
        }
      } finally {
        chartResize()
      }
    }

    // 模拟数据
    const chartData = {
      xAxis: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
      entry: [5, 8, 6, 9, 7, 10, 8],
      exit: [3, 4, 5, 3, 6, 4, 5]
    }

    // 当前显示的数据
    const currentData = ref({
      xAxis: chartData.xAxis,
      entry: chartData.entry,
      exit: chartData.exit
    })

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      updateChart()
    }

    // 更新图表
    const updateChart = (): void => {
      if (!chartInstance) return

      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          data: ['入驻', '退租'],
          right: calcFontSize(10),
          top: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(0), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: currentData.value.xAxis,
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
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '数量',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '入驻',
            type: 'line',
            data: currentData.value.entry,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#3b82f6'
            },
            lineStyle: {
              width: 3,
              color: '#3b82f6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ])
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值' }
              ],
              label: {
                color: '#ffffff',
                fontSize: calcFontSize(12)
              }
            }
          },
          {
            name: '退租',
            type: 'line',
            data: currentData.value.exit,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#ef4444'
            },
            lineStyle: {
              width: 3,
              color: '#ef4444'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(239, 68, 68, 0.5)' },
                { offset: 1, color: 'rgba(239, 68, 68, 0.1)' }
              ])
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值' }
              ],
              label: {
                color: '#ffffff',
                fontSize: calcFontSize(12)
              }
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
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    watch(()=>timeRange.value.timeType, ()=>{
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="物业租赁租户进出分析" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value} ></DateInlineForm>
        )
      }}>
        <div class='card-container-4' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})