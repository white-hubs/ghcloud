import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
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
import styles from './device-idle-statistics.module.less'
import { DatePicker } from 'ant-design-vue'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const DeviceIdleStatistics = defineComponent({
  setup () {
    const dateRange = ref<string[]>([])
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = {
      xAxis: ['设备A', '设备B', '设备C', '设备D', '设备E'],
      series: [
        { name: '有效使用时间', data: [70, 65, 80, 75, 85] },
        { name: '未使用时间', data: [30, 35, 20, 25, 15] }
      ]
    }
    const getData = async (): Promise<void> => {
      let period = dayjs(dateRange.value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs(dateRange.value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      if (dateRange.value.length === 0) {
        period = dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      const res = await PZService.laboratory.getDeviceIdleStatistics(period)
      chartData.xAxis = res.map(item => item.deviceName)
      chartData.series[0].data = res.map(item => item.useTime / (item.useTime + item.unUsedTime) * 100)
      chartData.series[1].data = res.map(item => item.unUsedTime / (item.useTime + item.unUsedTime) * 100)
      initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value}%<br/>${params[1].seriesName}: ${params[1].value}%`
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          data: chartData.series.map(item => item.name),
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(40),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(20)
        },
        xAxis: {
          type: 'category',
          data: chartData.xAxis,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '时间占比(%)',
          nameTextStyle: {
            fontSize: calcFontSize(12) // 设置name的字体大小，使用calcFontSize函数计算
          },
          min: 0,
          max: 100,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        series: [
          {
            name: '有效使用时间',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: chartData.series[0].data,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '未使用时间',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: chartData.series[1].data,
            itemStyle: {
              color: '#999999'
            }
          }
        ],
        dataZoom: chartData.xAxis.length > 5 ? [
          {
            type: 'slider',
            start: 0,
            end: 33
          },
        ] : []
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
    watch(()=>dateRange.value, getData)

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DatePicker.RangePicker
            v-model:value={dateRange.value}
            format="YYYY-MM-DD"
            style={{ marginLeft: '0.1rem' }}
            class={styles.datePicker}
          />
        )
      }}>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})