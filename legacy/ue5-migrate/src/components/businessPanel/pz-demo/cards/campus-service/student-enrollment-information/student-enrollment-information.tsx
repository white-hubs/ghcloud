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
import { PZService } from '@/components/businessPanel/pz-demo/card-service/service'
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const StudentEnrollmentInformation = defineComponent({
  name: 'StudentEnrollmentInformation',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const colors = ['#36D399', '#91cc75', '#fac858']
    let chartData = [
      { value: 1200, name: '本科生', itemStyle: { color: '#36D399' } },
      { value: 800, name: '研究生', itemStyle: { color: '#91cc75' } },
      { value: 300, name: '博士生', itemStyle: { color: '#fac858' } }
    ]

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        grid: {
          left: calcFontSize(10),
          right: calcFontSize(10),
          top: calcFontSize(10),
          bottom: calcFontSize(20),
        },
        series: [
          {
            name: '招生人数',
            type: 'pie',
            radius: ['40%', '55%'], // 修改这里，将圆环调小
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            data: chartData,
            label: {
              formatter: '{b}\n{c}人\n{d}%',
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
    const getData = async (): Promise<void>=>{
      const result = await PZService.school.getStudentEnrollmentInformation({
        period: '',
        type: ''
      })
      chartData = result.map((item, index)=>{
        return {
          value: item.number,
          name: item.name,
          itemStyle: { color: colors[index] }
        }
      })
      chartRef.value && initChart(chartRef.value as HTMLElement)
    }
    onMounted(async () => {
      chartRef.value && initChart(chartRef.value as HTMLElement)
      getData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='招生人数'>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})