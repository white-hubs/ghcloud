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

export const ActivityGroupAge = defineComponent({
  name: 'ActivityGroupAge',
  setup () {
    // 图表实例
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const activityData = reactive({
      categories: ['文化活动', '体育活动', '学术讲座', '社团活动', '志愿服务'],
      male: [120, 180, 80, 150, 90],
      female: [100, 120, 150, 180, 110]
    })

    // 计算总数和比例
    const totalData = computed(() => {
      const result = {
        total: [] as number[],
        maleRatio: [] as string[],
        femaleRatio: [] as string[]
      }

      for (let i = 0; i < activityData.categories.length; i++) {
        const total = activityData.male[i] + activityData.female[i]
        result.total.push(total)
        result.maleRatio.push((activityData.male[i] / total * 100).toFixed(1))
        result.femaleRatio.push((activityData.female[i] / total * 100).toFixed(1))
      }
      return result
    })

    // 计算总参与人数
    const totalParticipants = computed(() => {
      const maleTotal = activityData.male.reduce((sum, current) => sum + current, 0)
      const femaleTotal = activityData.female.reduce((sum, current) => sum + current, 0)
      return maleTotal + femaleTotal
    })
    const getData = async (): Promise<void>=>{
      const result = await PZService.school.getActivityGroupGender({
        type: '',
        period: ''
      })
      activityData.categories = result.map(item=>item.name)
      activityData.male = result.map(item=>item.maleNumber)
      activityData.female = result.map(item=>item.femaleNumber)
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    // 初始化图表
    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params): string {
            const maleIndex = params[0].dataIndex
            const category = activityData.categories[maleIndex]
            const maleValue = activityData.male[maleIndex]
            const femaleValue = activityData.female[maleIndex]
            const total = maleValue + femaleValue
            const maleRatio = totalData.value.maleRatio[maleIndex]
            const femaleRatio = totalData.value.femaleRatio[maleIndex]

            return `${category}<br/>
                    <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#5470c6;"></span>男生: ${maleValue}人 (${maleRatio}%)<br/>
                    <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#ee6666;"></span>女生: ${femaleValue}人 (${femaleRatio}%)<br/>
                    <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#909399;"></span>总计: ${total}人`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          },
        },
        legend: {
          data: ['男生', '女生'],
          right: calcFontSize(10),
          top: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          itemWidth: calcFontSize(15),
          itemHeight: calcFontSize(10)
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
          data: activityData.categories,
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
            fontSize: calcFontSize(12),
            interval: 0,
            rotate: 15
          }
        },
        yAxis: {
          type: 'value',
          name: '参与人数',
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
            name: '男生',
            type: 'bar',
            stack: '总量',
            barWidth: calcFontSize(30),
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#5470c6' },
                { offset: 1, color: '#5470c680' }
              ])
            },
            data: activityData.male,
            label: {
              show: true,
              position: 'inside',
              formatter: function (params): string {
                const index = params.dataIndex
                return totalData.value.maleRatio[index] + '%'
              },
              fontSize: calcFontSize(10),
              color: '#ffffff'
            }
          },
          {
            name: '女生',
            type: 'bar',
            stack: '总量',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ee6666' },
                { offset: 1, color: '#ee666680' }
              ])
            },
            data: activityData.female,
            label: {
              show: true,
              position: 'inside',
              formatter: function (params): string {
                const index = params.dataIndex
                return totalData.value.femaleRatio[index] + '%'
              },
              fontSize: calcFontSize(10),
              color: '#ffffff'
            }
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
          <span>活动群体性别</span>
          <span style={{
            marginLeft: calcFontSize(10),
            fontSize: calcFontSize(14),
            color: '#3B82F6',
            fontWeight: 'normal'
          }}>
            总参与: {totalParticipants.value}人
          </span>
        </div>
      )
    }

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={panelSlots}>
        <div class="card-container-2" ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})