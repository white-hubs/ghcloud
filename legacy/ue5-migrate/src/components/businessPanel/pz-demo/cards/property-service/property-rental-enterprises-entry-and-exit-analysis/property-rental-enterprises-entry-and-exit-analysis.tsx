import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const PropertyRentalEnterprisesEntryAndExitAnalysis = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const typeMap = {
      1: '大型企业',
      2: '中型企业',
      3: '小型企业',
      4: '微型企业'
    }

    // 企业类型数据
    const enterpriseData = [
      {
        name: '大型企业',
        value: 20,
      },
      {
        name: '中型企业',
        value: 35,
      },
      {
        name: '小型企业',
        value: 25,
      },
      {
        name: '微型企业',
        value: 15,
      }
    ]
    const getData = async (): Promise<void> => {
      try {
        const res = await PZService.property.getPropertyRentAnalysisSettledEnterpriseAnalysis()
        enterpriseData.length = 0
        res.forEach(item => {
          enterpriseData.push({
            name: typeMap[item.enterpriseSizeType],
            value: item.enterpriseSizeTypeCount
          })
        })
      } finally {
        chartRef.value && initChart(chartRef.value)
      }
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string=> {
            return `${params.name}<br/>入驻数量：${params.value}家<br/>占比：${params.percent}%`
          }
        },
        legend: {
          orient: 'vertical',
          right: calcFontSize(0),
          top: 'center',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          itemGap: calcFontSize(16),
          formatter: (name): string=> {
            const item = enterpriseData.find(data => data.name === name)
            const total = enterpriseData.reduce((sum, data) => sum + data.value, 0)
            const percent = ((item.value / total) * 100).toFixed(1)
            return `${name}  ${item.value}家  ${percent}%`
          },
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            rich: {
              value: {
                width: calcFontSize(40),
                align: 'right'
              }
            }
          }
        },
        series: [
          {
            name: '企业类型分布',
            type: 'pie',
            radius: ['35%', '60%'],
            center: ['25%', '50%'],
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
            data: enterpriseData,
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
      }
      chartInstance.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="企业类型分布">
        <div class="card-container-3" ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})