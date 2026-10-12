import { defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize, generateXAxisData } from '@/utils/common'
import styles from './maintenance-statistics.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import { cubeMaintainStatisticsService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

export const MaintenanceStatistics = defineComponent({
  name: 'MaintenanceStatistics',
  setup () {
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })
    let chartInstance = null
    const chartRef = ref(null)

    const chartData = reactive({
      categories: [],
      values: []
    })

    const total = ref(0)
    
    const getData = async (): Promise<void>=>{      
      const result = await cubeMaintainStatisticsService.getMaintenanceStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const xAxisData = generateXAxisData(timeRange.value.timeType);
      const mappedValues = new Array(xAxisData.length).fill(0);
      
      result.forEach((item) => {
        let index = -1;
        switch(timeRange.value.timeType) {
          case 'TODAY':
            index = parseInt(item.date.split(':')[0]);
            break;
          case 'THIS_WEEK':
          case 'THIS_MONTH':
          case 'THIS_YEAR':
            index = parseInt(item.date) - 1;
            break;
        }
        
        if (index >= 0 && index < mappedValues.length) {
          mappedValues[index] = item.num;
        }
      });
      
      chartData.categories = xAxisData;
      chartData.values = mappedValues;
      total.value = chartData.values.reduce((prev, curr) => prev + curr, 0);
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
            const value = params[0].value || 0
            const percentage = total.value !== 0 ? ((value / total.value) * 100).toFixed(0) : 0
            return `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params[0].color};margin-right:5px;"></span>
              <span>${params[0].name}</span>
            </div>
            数量：${value}次<br/>占比：${percentage}%`
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(10),
          top: calcFontSize(35),
          bottom: calcFontSize(10),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.categories,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: timeRange.value.timeType !== 'THIS_MONTH' ? 0 : "auto",
            // rotate: chartData.categories.length > 12 ? 45 : 0 // 如果标签太多，旋转标签
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
        series: [
          {
            type: 'bar',
            data: chartData.values,
            barWidth: calcFontSize(20),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#188df0' }, // 顶部不透明
                { offset: 1, color: 'rgba(24, 141, 240, 0)' } // 底部完全透明
              ])
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params) {
                return params.value > 0 ? params.value + '次' : '';
              },
              color: '#ffffff',
              fontSize: calcFontSize(12),
              overflow: 'truncate'  // 如果空间不足，截断文本而不是完全隐藏
            }
          }
        ]
      }

      if (chartInstance) {
        chartInstance.setOption(option)
      }
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
    watch(() => timeRange.value.timeType, () => {
      updateChart()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="维保统计" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}
          timeList={[
            { label: "本周", value: "THIS_WEEK" },
            { label: "本月", value: "THIS_MONTH" },
            { label: "今年", value: "THIS_YEAR" }
          ]} />
        )
      }}>
        <div class={['card-container-3']} >
          {chartData.values.length === 0 && <NoData />}
          <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})