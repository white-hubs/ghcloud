import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

export const StudentCourseScoreStatistics = defineComponent({
  name: 'StudentCourseScoreStatistics',
  setup () {
    // 创建图表引用
    const chartRef = ref<HTMLElement | null>(null)
    let chartInstance: echarts.ECharts | null = null

    // 模拟成绩区间数据
    let scoreData = [
      { grade: 'A+', count: 120, percentage: '24%' },
      { grade: 'A', count: 150, percentage: '30%' },
      { grade: 'B+', count: 80, percentage: '16%' },
      { grade: 'B', count: 60, percentage: '12%' },
      { grade: 'C+', count: 40, percentage: '8%' },
      { grade: 'C', count: 30, percentage: '6%' },
      { grade: 'D', count: 20, percentage: '4%' }
    ]

    // 初始化图表
    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params: any): string {
            const data = params[0];
            return `${data.name}: <strong>${data.value}</strong>人 (${scoreData[data.dataIndex].percentage})`;
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(30), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '学生人数',
          nameTextStyle: {
            fontSize: calcFontSize(12),
            padding: [0, 0, 0, calcFontSize(10)]
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ddd'
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: 'rgba(255, 255, 255, 0.2)'
            }
          },
          axisLabel: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'category',
          data: scoreData.map(item => item.grade),
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
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
            name: '学生人数',
            type: 'bar',
            barWidth: '40%',
            data: scoreData.map((item, index) => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: ['#36D399', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452'][index % 7] },
                  { offset: 1, color: ['#7AECB3', '#b3e19d', '#ffe0a1', '#f5a4a4', '#a1d8ed', '#7dcfb0', '#fdb595'][index % 7] }
                ])
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: function (params: any): string {
                return `${params.value}人 (${scoreData[params.dataIndex].percentage})`;
              },
              fontSize: calcFontSize(12),
              color: '#ffffff'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ],
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number): number {
          return idx * 100;
        }
      }

      chartInstance.setOption(option as any)
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }
    const getData = async (): Promise<void>=>{
      const result = await PZService.school.getStudentCourseScoreStatistics({
        period: '',
        type: ''
      })
      const total = result.reduce((sum, item) => sum + item.number, 0)
      scoreData = result.map(item=>{
        return {
          grade: item.name,
          count: item.number,
          percentage: (item.number / total * 100).toFixed(2) + '%'
        }
      })
      initChart(chartRef.value as HTMLElement)
    }

    onMounted(() => {
      chartRef.value && initChart(chartRef.value as HTMLElement)
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="学生成绩区间统计">
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})