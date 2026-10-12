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

export const PropertyPaymentAmountOverview = defineComponent({
  name: 'PropertyPaymentAmountOverview',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)

    // 模拟数据 - 各区域缴费金额
    const chartData = [
      { value: 0, name: 'A区' },
      { value: 0, name: 'B区' },
      { value: 0, name: 'C区' },
      { value: 0, name: 'D区' },
      { value: 0, name: 'E区' }
    ]
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.property.getPropertyPaymentAnalysisAmountOverview()
        if (res.length){
          chartData.length = 0
          res.forEach(item=>{
            chartData.push({
              value: item.amount,
              name: item.area
            })
          })
        }
      } catch {

      }
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }

    // 计算总金额
    const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0)

    // 格式化金额显示
    const formatAmount = (amount): string => {
      return amount >= 10000
        ? (amount / 10000).toFixed(2) + '万'
        : amount.toFixed(2)
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `${params.name}<br/>缴费金额: ${formatAmount(params.value)}元<br/>占比: ${params.percent}%`
          },
          textStyle: {
            fontSize: calcFontSize(12),
          },
          confine: true
        },
        series: [
          {
            name: '缴费金额',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['45%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1
            },
            label: {
              fontsize: calcFontSize(12),
              color: '#ffffff',
              formatter: '{b}\n{c}元'
            },
            labelLine: {
              lineStyle: {
                color: '#ffffff'
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: calcFontSize(14),
                fontWeight: 'bold',
                formatter: '{b}\n{c}元'
              }
            },
            data: chartData,
            color: [
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de'
            ]
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
      <SubPanelTemplate title='物业缴费金额总览'>
        <div class='card-container-4' ref={chartRef} style="position: relative;">
          <div class='card-content' style={{
            position: 'absolute',
            left: '40%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            maxWidth: calcFontSize(120),
            pointerEvents: 'none'
          }}>
            <div style={{
              fontSize: calcFontSize(14),
              color: '#ffffff',
              marginBottom: calcFontSize(5)
            }}>
              总缴费金额
            </div>
            <div style={{
              fontSize: calcFontSize(20),
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              {formatAmount(totalAmount)}元
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})