import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
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
import { DatePicker } from 'ant-design-vue'
import styles from './space-utilization.module.less'
import dayjs from 'dayjs'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const SpaceUtilization = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const dateRange = ref<string[]>([])
    const chartData = {
      xAxis: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
      series: [
        { name: '1栋', data: [80, 82, 85, 83, 87, 85, 88] },
        { name: '2栋', data: [75, 78, 80, 82, 85, 83, 86] },
        { name: '3栋', data: [70, 72, 75, 78, 80, 82, 85] }
      ]
    }
    const getData = async (): Promise<void> => {
      let days = dayjs(dateRange.value[1]).diff(dayjs(dateRange.value[0]), 'day')
      let period = dayjs(dateRange.value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs(dateRange.value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      if (dateRange.value.length === 0) {
        period = dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
        days = 6
      }
      const res = await PZService.laboratory.getSpaceUtilization(period)
      // 根据period的天数
      chartData.xAxis = []
      for (let i = 0; i <= days; i++) {
        chartData.xAxis.push(dayjs(dateRange.value[0]).add(i, 'day').format('MM-DD'))
      }
      chartData.series = res.map(item => ({
        name: item.spaceName,
        // item.list 中有 date 字段，先根据 date 升序排序，再映射获取 deviceUtilization 并乘以 100
        data: item.list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ele => ele.deviceUtilization * 100)
      }))
      initChart(chartRef.value as HTMLElement)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        toolbox: {
          feature: {
            saveAsImage: {
              title: '',
              type: 'png',
              pixelRatio: 2,
              backgroundColor: '#000',
              name: '空间利用率统计',
              iconStyle: {
                borderColor: '#ffffff'
              }
            }
          },
          left: 0,
          top: 0,
          iconStyle: {
            borderColor: '#ffffff'
          }
        },
        tooltip: {
          trigger: 'axis',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        grid: {
          left: calcFontSize(30),
          right: calcFontSize(0),
          top: calcFontSize(40),
          bottom: calcFontSize(30)
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
          name: '利用率(%)',
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
        series: chartData.series.map(item => ({
          name: item.name,
          type: 'line',
          smooth: true,
          data: item.data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#91cc75' },
              { offset: 1, color: '#5470c6' }
            ])
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0)' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#91cc75' },
                { offset: 1, color: '#5470c6' }
              ])
            }
          }
        }))
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
    watch(()=>dateRange.value, chartResize)

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