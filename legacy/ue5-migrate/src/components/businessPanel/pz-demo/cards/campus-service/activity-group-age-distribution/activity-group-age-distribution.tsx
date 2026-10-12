import { defineComponent, reactive, ref, onMounted, onUnmounted, computed } from 'vue'
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
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const ActivityGroupAgeDistribution = defineComponent({
  name: 'ActivityGroupAgeDistribution',
  setup () {
    // 图表实例
    let chartInstance: echarts.ECharts | null = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据
    const chartData = reactive({
      xAxis: ['文化活动', '体育活动', '学术讲座', '社团活动', '志愿服务'],
      series: [
        {
          name: '18-20岁',
          data: [120, 150, 80, 200, 100],
          color: 'rgba(59, 130, 246, 0.75)' // 降低蓝色亮度
        },
        {
          name: '20-22岁',
          data: [100, 130, 90, 150, 80],
          color: 'rgba(139, 92, 246, 0.75)' // 降低紫色亮度
        },
        {
          name: '22-24岁',
          data: [80, 100, 60, 120, 70],
          color: 'rgba(236, 72, 153, 0.75)' // 降低粉色亮度
        },
        {
          name: '24岁以上',
          data: [50, 70, 40, 80, 50],
          color: 'rgba(245, 158, 11, 0.75)' // 降低橙色亮度
        }
      ]
    })

    // 计算总数和比例
    const totalData = computed(() => {
      const result = [];
      for (let i = 0; i < chartData.xAxis.length; i++) {
        let total = 0;
        const detail = [];

        for (let j = 0; j < chartData.series.length; j++) {
          const value = chartData.series[j].data[i];
          total += value;
          detail.push({
            name: chartData.series[j].name,
            value,
          });
        }

        result.push({
          activityType: chartData.xAxis[i],
          total,
          detail: detail.map(item => ({
            ...item,
            percentage: ((item.value / total) * 100).toFixed(1) + '%'
          }))
        });
      }
      return result;
    });

    // 初始化图表
    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params): string{
            const activityIndex = params[0].dataIndex;
            const activityData = totalData.value[activityIndex];

            let html = `${activityData.activityType}<br/>总人数: ${activityData.total}<br/><br/>`;

            for (let i = 0; i < params.length; i++) {
              const item = params[i];
              const detailItem = activityData.detail.find(d => d.name === item.seriesName);

              html += `${item.marker} ${item.seriesName}: ${item.value}人 (${detailItem.percentage})<br/>`;
            }

            return html;
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
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
          data: chartData.xAxis,
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
        series: chartData.series.map((item) => ({
          name: item.name,
          type: 'bar',
          stack: '总量',
          emphasis: {
            focus: 'series'
          },
          data: item.data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: item.color },
            ])
          }
        }))
      }

      chartInstance.setOption(option)
    }
    const getData = async (): Promise<void> => {
      // TODO: 获取数据
      const result = await PZService.school.getActivityGroupAge({
        period: '',
        type: ''
      })
      chartData.xAxis = result.map(item => item.name)
      chartData.series[0].data = result.map(item => item.twenty)
      chartData.series[1].data = result.map(item => item.twentyTwo)
      chartData.series[2].data = result.map(item => item.twentyFour)
      chartData.series[3].data = result.map(item => item.other)
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    // 图表重绘
    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
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
          <span>活动群体年龄分布</span>
        </div>
      )
    }

    return (): JSX.Element => (
      <SubPanelTemplate title='活动群体年龄分布' v-slots={panelSlots}>
        <div class="card-container-2" ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})