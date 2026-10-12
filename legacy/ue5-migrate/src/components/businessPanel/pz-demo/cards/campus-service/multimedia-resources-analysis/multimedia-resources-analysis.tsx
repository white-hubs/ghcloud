import { defineComponent, reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const MultimediaResourcesAnalysis = defineComponent({
  name: 'MultimediaResourcesAnalysis',
  setup () {
    // 图表实例
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const resourceData = reactive({
      categories: ['PPT', '视频', '音频', '图片', '文档'],
      values: [10, 30, 15, 25, 20],
      colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
    })
    const getData = async (): Promise<void>=>{
      const result = await PZService.school.getMultimediaResourcesAnalysis({
        period: '',
        type: ''
      })
      resourceData.categories = result.map(item=>item.name)
      resourceData.values = result.map(item=>item.number)
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    // 计算总数
    const totalResources = computed(() => {
      return resourceData.values.reduce((sum, current) => sum + current, 0)
    })

    // 初始化图表
    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}个',
          textStyle: {
            fontSize: calcFontSize(12)
          },
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(10),
          top: calcFontSize(50),
          bottom: calcFontSize(10),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: resourceData.categories,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '数量（个）',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            padding: [0, 0, 5, 0]
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
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
            name: '资源数量',
            type: 'bar',
            barWidth: calcFontSize(30),
            data: resourceData.categories.map((category, index) => {
              return {
                value: resourceData.values[index],
                name: category,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: resourceData.colors[index] },
                    { offset: 1, color: resourceData.colors[index] + '80' }
                  ]),
                  borderRadius: [calcFontSize(4), calcFontSize(4), 0, 0]
                },
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{c}个',
                  fontSize: calcFontSize(12),
                  color: '#ffffff'
                }
              }
            })
          }
        ]
      }
      chartInstance.setOption(option)
    }

    // 图表重绘
    const chartResize = (): void => {
      chartInstance && chartInstance.resize()
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

    // 定义插槽
    const panelSlots = {
      title: (): JSX.Element => (
        <div style="display: flex; align-items: center;">
          <span>多媒体资源分析</span>
          <span style={{
            marginLeft: calcFontSize(10),
            fontSize: calcFontSize(14),
            color: '#3B82F6',
            fontWeight: 'normal'
          }}>
            总数：{totalResources.value}个
          </span>
        </div>
      )
    }

    return (): JSX.Element => (
      <SubPanelTemplate title='多媒体资源分析' v-slots={panelSlots}>
        <div class="card-container-2" ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})