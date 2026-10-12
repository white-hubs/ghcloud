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
export const StudentPersonalInformation = defineComponent({
  name: 'StudentPersonalInformation',
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    let chartData = [
      { value: 335, name: '男生' },
      { value: 310, name: '女生' }
    ]

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          textStyle: {
            fontSize: calcFontSize(12)
          }
        },
        series: [
          {
            name: '学生数量',
            type: 'pie',
            radius: '50%',
            center: ['45%', '50%'],
            data: chartData,
            avoidLabelOverlap: false,
            label: {
              formatter: '{b}\n{c}\n({d}%)',
              position: 'inside',
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
    const getChartData = async (): Promise<void> => {
      const result = await PZService.school.getStudentPersonalInformation({
        period: '',
        type: ''
      })
      chartData = result.map(item=>{
        return {
          value: item.number,
          name: item.name
        }
      })
      chartRef.value && initChart(chartRef.value as HTMLElement)
      // if (res.code === 200)
    }
    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(async () => {
      chartRef.value && initChart(chartRef.value as HTMLElement)
      getChartData()
      window.addEventListener('resize', chartResize)
    })
    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='学生个人信息'>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})