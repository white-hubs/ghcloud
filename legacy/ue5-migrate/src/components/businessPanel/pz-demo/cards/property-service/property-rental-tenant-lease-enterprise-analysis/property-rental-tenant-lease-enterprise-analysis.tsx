import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRentalTenantLeaseEnterpriseAnalysis = defineComponent({
  name: 'PropertyRentalTenantLeaseEnterpriseAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const chartData = [
      {
        value: 20,
        name: '外企',
      },
      {
        value: 15,
        name: '国企',
      },
      {
        value: 25,
        name: '民营',
      },
      {
        value: 10,
        name: '合资',
      },
      {
        value: 5,
        name: '其他',
      }
    ]
    const enterpriseType = {
      1: '外企',
      2: '国企',
      3: '民营',
      4: '合资',
      5: '其他'
    }
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyRentAnalysisLeaseEnterpriseAnalysis()
        chartData.length = 0
        res.forEach(item => {
          chartData.push({
            value: item.enterpriseTypeCount,
            name: enterpriseType[item.enterpriseType]
          })
        })
      } finally {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `${params.name}<br/>租赁数量：${params.value}家<br/>占比：${params.percent}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          },
          confine: true,
          extraCssText: 'max-width: 200px; white-space: normal; word-break: break-all;'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: calcFontSize(0),
          top: 'middle',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          itemGap: calcFontSize(16),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          formatter: (name) => {
            const item = chartData.find(data => data.name === name)
            const total = chartData.reduce((sum, data) => sum + data.value, 0)
            const percent = ((item.value / total) * 100).toFixed(1)
            return `${name}  ${item.value}家  ${percent}%`
          }
        },
        series: [
          {
            name: '企业类型',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['30%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'inside',
              formatter: '{d}%',
              fontSize: calcFontSize(14),
              fontWeight: 'bold',
              color: '#ffffff'
            },
            labelLine: {
              show: false
            },
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontSize: calcFontSize(16),
                fontWeight: 'bold'
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

    return (): JSX.Element => (
      <SubPanelTemplate title='物业租赁租户租赁企业分析'>
        <div class='card-container-3' ref={chartRef} ></div>
      </SubPanelTemplate>
    )
  }
})