import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnergyConsumptionTrend = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    // 生成 2025 年 1 月 1 日到当前时间的日期数组
    const generateDateRange = (): unknown[] => {
      const start = new Date('2025-01-01');
      const end = new Date();
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
      }
      return dates;
    };
    const chartData = {
      xAxis: generateDateRange(),
      series: [] // 示例随机数据，请替换为实际数据
    }
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getEnergyTrend();
      if (res.length){
        chartData.xAxis = res.map(item=>dayjs(item.recordDate).format('YYYY-MM-DD'));
        chartData.series = res.map(item=>item.trendValue);
      }
      chartRef.value && initChart(chartRef.value as HTMLElement);
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(35)
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#ffffff' // 设置x轴线条颜色为白色
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff' // 设置x轴刻度线颜色为白色
            }
          },
          axisLabel: {
            interval: 7, // 调整此值来控制刻度的步进，这里设置为每 7 天显示一个刻度
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff', // 设置 x 轴名称文字颜色为白色
            fontSize: calcFontSize(12)
          },
          type: 'category',
          data: chartData.xAxis,
        },
        yAxis: {
          type: 'value',
          name: '能耗值',
          axisLabel: {
            interval: 0,
            color: '#ffffff', // 设置 y 轴文字颜色为白色
            fontSize: calcFontSize(12) // 设置 y 轴文字字体大小为 12
          },
          nameTextStyle: {
            color: '#ffffff', // 设置 y 轴名称文字颜色为白色
            fontSize: calcFontSize(12)
          },
        },
        series: [{
          name: '能耗趋势',
          type: 'line',
          smooth: true,
          data: chartData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#188df0' },
              { offset: 1, color: 'rgba(24, 141, 240, 0)' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 1, color: 'rgba(35, 120, 247, 0)' }
              ])
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 141, 240, 0.5)' },
              { offset: 1, color: 'rgba(24, 141, 240, 0)' }
            ])
          }
        }],
        dataZoom: [
          {
            type: 'slider',
            start: 0, // 起始位置，0 表示 0%
            end: 50, // 结束位置，33.33 表示 33.33%，即默认展示 1/3
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

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})