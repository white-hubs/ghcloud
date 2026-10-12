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

export const PropertyRentalTenantLeaseDataStatistics = defineComponent({
  name: 'PropertyRentalTenantLeaseDataStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const typeMap = {
      1: '长租',
      2: '短租',
      3: '临时租赁'
    }
    const chartData = [
      { value: 65, name: '长租' },
      { value: 35, name: '短租' }
    ]
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.property.getPropertyRentAnalysisLeaseDataStatistics()
        chartData.length = 0
        res.forEach(item=>{
          chartData.push({
            value: item.leaseTypeCount,
            name: typeMap[item.leaseType]
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
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12),
          },
          confine: true, // 确保提示框在图表区域内
          enterable: true, // 鼠标可进入提示框
          appendToBody: false, // 不将提示框添加到body，而是添加到图表容器中
          padding: [5, 10], // 调整内边距
          extraCssText: 'max-width: 200px; white-space: normal; word-break: break-all;' // 设置最大宽度并允许文字换行
        },
        series: [
          {
            name: '租赁数量',
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}\n{c}\n({d}%)',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              padding: [8, 4], // 添加内边距
              lineHeight: 20 // 增加行高
            },
            labelLine: {
              show: true,
              length: 15, // 增加第一段线长
              length2: 10, // 增加第二段线长
              smooth: true // 添加平滑效果
            },
            data: chartData,
            color: [
              '#3b82f6', // 蓝色 - 长租
              '#f59e0b' // 黄色 - 短租
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
      <SubPanelTemplate title='物业租赁租户租赁数据统计'>
        <div class='card-container-4' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})