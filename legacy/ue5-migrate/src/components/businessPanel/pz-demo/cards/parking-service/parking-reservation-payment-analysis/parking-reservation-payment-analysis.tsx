import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent
])

interface PaymentData {
  name: string;
  value: number;
  ratio: number;
  itemStyle: {
    color: string;
  };
}

export const ParkingReservationPaymentAnalysis = defineComponent({
  name: 'ParkingReservationPaymentAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const paymentData = ref<PaymentData[]>([])

    const getData = async (): Promise<{ name: string; value: number; }[]> => {
      try {
        const result = await PZService.parking.getPaymentMethodAnalysis()
        const data = result?.map(item => ({
          name: item.type === 'CASH' ? '现金' :
            item.type === 'ALIPAY' ? '支付宝' :
              item.type === 'WECHAT' ? '微信' :
                item.type === 'CREDIT_CARD' ? '信用卡' : '其他',
          value: item.count,
        }))
        return data
      } catch {
      }
    }
    // 模拟获取支付数据，实际项目中替换为真实API调用
    const fetchPaymentData = async (): Promise<void> => {
      // 这里替换为实际API调用
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
      let data = [
        { name: '微信支付', value: 150 },
        { name: '支付宝', value: 120 },
        { name: '银联', value: 50 },
        { name: '其他', value: 20 }
      ]
      data = await getData()
      const total = data.reduce((sum, item) => sum + item.value, 0)
      paymentData.value = data.map((item, index) => ({
        name: item.name,
        value: item.value,
        ratio: Number(((item.value / total) * 100).toFixed(1)),
        itemStyle: {
          color: colors[index]
        }
      }))
    }

    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            return `${params.name}<br/>支付笔数：${params.value}笔<br/>占比：${params.data.ratio}%`
          },
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [{
          type: 'pie',
          radius: '75%',
          center: ['45%', '50%'],
          label: {
            show: true,
            position: 'inside',
            formatter: (params): string => {
              return `${params.name}\n${params.data.ratio}%`
            },
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 20 // 增加行高
          },
          emphasis: {
            label: {
              show: true,
              fontSize: calcFontSize(14),
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: paymentData.value
        }]
      }

      chartInstance?.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      fetchPaymentData().then(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='停车预约支付分析'>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})