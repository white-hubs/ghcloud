import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
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

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const ParkingFeeMonthlyServiceRatio = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const monthlyData = ref({
      total: 0,
      monthly: 0,
      ratio: '0'
    })

    // 模拟获取数据，实际项目中替换为真实API调用
    const fetchMonthlyData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const data = {
        total: 200, // 总车位数
        monthly: 80 // 包月车位数
      }
      monthlyData.value = {
        total: data.total,
        monthly: data.monthly,
        ratio: ((data.monthly / data.total) * 100).toFixed(1)
      }
    }

    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            return `${params.name}<br/>数量：${params.value}个<br/>占比：${params.percent}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          name: '包月服务统计',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%',
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          data: [
            {
              name: '包月车位',
              value: monthlyData.value.monthly,
              itemStyle: {
                color: '#3B82F6'
              }
            },
            {
              name: '临时车位',
              value: monthlyData.value.total - monthlyData.value.monthly,
              itemStyle: {
                color: '#10B981'
              }
            }
          ]
        }]
      }

      chartInstance.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      fetchMonthlyData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='停车费用月度服务比例'>
        <div class='card-container-3' style="position: relative;">
          <div style={{
            color: '#ffffff',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '5px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: calcFontSize(14) }}>包月车位数</div>
            <div style={{
              fontSize: calcFontSize(24),
              fontWeight: 'bold',
              marginTop: '5px'
            }}>
              {monthlyData.value.monthly}
              <span style={{
                fontSize: calcFontSize(12),
                marginLeft: '5px'
              }}>
                / {monthlyData.value.total}
              </span>
            </div>
          </div>
          <div ref={chartRef} style="width: 100%; height: 100%"></div>
        </div>
      </SubPanelTemplate>
    )
  }
})