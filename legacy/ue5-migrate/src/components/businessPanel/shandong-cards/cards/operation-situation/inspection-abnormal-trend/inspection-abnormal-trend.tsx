import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './inspection-abnormal-trend.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize, generateXAxisData } from '@/utils/common'
import { cubeMaintainStatisticsService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";
import { InspectTaskTrendVo } from '@ghcloud/cube-maintain-service'

use([
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const InspectionAbnormalTrend = defineComponent({
  name: 'InspectionAbnormalTrend',
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_MONTH',
      dateRange: []
    })
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 模拟数据
    const mockData = {
      // TODAY: {
      //   xData: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      //   exception: [30, 25, 20, 35, 80, 120, 100, 110, 90, 85, 60, 40],
      //   inspect: [70, 75, 80, 65, 20, 30, 50, 40, 60, 65, 90, 110]
      // },
      // THIS_WEEK: {
      //   xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      //   exception: [80, 85, 90, 95, 88, 70, 65],
      //   inspect: [20, 15, 10, 5, 12, 30, 35]
      // },
      // THIS_MONTH: {
      //   xData: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      //   exception: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50 + 30)),
      //   inspect: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30 + 20))
      // },
      // THIS_YEAR: {
      //   xData: Array.from({ length: 12 }, (_, i) => `${i + 1}`),
      //   exception: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50 + 30)),
      //   inspect: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30 + 20))
      // }
    }

    const updateChart = async (): Promise<void> =>{
      await getData()
      // 确保图表实例存在
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }

      const currentData = mockData[timeRange.value.timeType]
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
              if (param.seriesName === '异常数') {
                result += `${colorSpan}异常数：${param.value}个<br/>`
              } else if (param.seriesName === '总数') {
                result += `${colorSpan}总数：${param.value}个<br/>`
              }
            })
            // 添加异常率计算
            const exceptionValue = params.find(p => p.seriesName === '异常数')?.value || 0
            const totalValue = params.find(p => p.seriesName === '总数')?.value || 1
            result += `异常率：${((exceptionValue / totalValue) * 100).toFixed(1)}%`
            
            return result
          }
        },
        legend: {
          data: ['异常数', '总数'],
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
          right: calcFontSize(10),
          bottom: calcFontSize(30),
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
            interval: timeRange.value.timeType !== 'THIS_MONTH' ? 0 : "auto",
          },
          axisTick: {
            alignWithLabel: true
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
            name: '异常数',
            type: 'line',
            smooth: true,
            showSymbol: false,
            emphasis: { 
              focus: "series",
            },
            data: currentData.exception,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
              ])
            },
            lineStyle: {
              color: '#F59E0B',
            },
            // 确保图例颜色与线条一致
            itemStyle: {
              color: '#F59E0B'
            }
          },
          {
            name: '总数',
            type: 'line',
            smooth: true,
            showSymbol: false,
            emphasis: { 
              focus: "series",
            },
            data: currentData.inspect,
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
    const resultData = ref<InspectTaskTrendVo[]>([])
    const getData = async (): Promise<void> =>{
      try {
        const result = await cubeMaintainStatisticsService.getPatrolTaskTrend({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(',')
        })
        resultData.value = result
        
        const xAxisData = generateXAxisData(timeRange.value.timeType);
        const mappedExceptionValues = new Array(xAxisData.length).fill(0);
        const mappedInspectValues = new Array(xAxisData.length).fill(0);
        
        result.forEach((item) => {
          let index = -1;
          switch(timeRange.value.timeType) {
            case 'THIS_WEEK':
            case 'THIS_MONTH':
            case 'THIS_YEAR':
              index = parseInt(item.date) - 1;
              break;
          }
          
          if (index >= 0 && index < mappedExceptionValues.length) {
            mappedExceptionValues[index] = item.exceptionNum;
            mappedInspectValues[index] = item.inspectNum;
          }
        });
        mockData[timeRange.value.timeType] = {
          xData: xAxisData,
          exception: mappedExceptionValues,
          inspect: mappedInspectValues,
        }

      } catch {
      }
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

    watch(() => timeRange.value.timeType, () => {
      updateChart()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="巡检异常趋势" v-slots={{
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
        {resultData.value.length === 0 && <NoData />}
        <div ref={chartRef} style="width: 100%; height: 100%" ></div>
      </div>
      </SubPanelTemplate>
    )
  }
})