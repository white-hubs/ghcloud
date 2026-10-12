import { defineComponent, ref, onMounted, onUnmounted, watch, reactive, nextTick } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { cubeThirdConnectionService } from '@/api/service'
import NoData from "@/components/businessPanel/public/noData.vue";

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])
export const trainingPeopleProportion = defineComponent({
  name: 'trainingPeopleProportion',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6']
    const resultData= ref<{  name: string, value: number, ratio: number, itemStyle: { color: string }} []>([
      {
        name: '市委党校',
        value:  0,
        ratio: 0,
        itemStyle: { color: colors[0] }
      },
      {
        name: '社会主义学院',
        value:  0,
        ratio: 0,
        itemStyle: { color: colors[1] }
      },
      {
        name: '委托办班',
        value:  0,
        ratio: 0,
        itemStyle: { color: colors[2] }
      },
    ])
    const getData = async (): Promise<void>=>{
      const res = await cubeThirdConnectionService.getEducationalDataOverview()
      if (res) {
        const { swdx_xy_num = 0, shzyxy_xy_num = 0, wtbb_xy_num = 0 } = res;
        const total = swdx_xy_num + shzyxy_xy_num + wtbb_xy_num
  
        resultData.value = [
          {
            name: '市委党校',
            value: swdx_xy_num ?? 0,
            ratio: swdx_xy_num ? (swdx_xy_num / total) * 100 : 0,
            itemStyle: { color: colors[0] }
          },
          {
            name: '社会主义学院',
            value: shzyxy_xy_num ?? 0,
            ratio: shzyxy_xy_num ? (shzyxy_xy_num / total) * 100 : 0,
            itemStyle: { color: colors[1] }
          },
          {
            name: '委托办班',
            value: wtbb_xy_num ?? 0,
            ratio: wtbb_xy_num ? (wtbb_xy_num / total) * 100 : 0,
            itemStyle: { color: colors[2] }
          },
        ]
      }
    }
    const updateChart = async (): Promise<void> => {
      await getData()
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
      }
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const percentage = params.data.ratio ? params.data.ratio.toFixed(0) : 0
            return `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>
              <span>${params.name}</span>
            </div>
            人数：${params.value}个<br/>占比：${percentage}%`
          }
        },
        legend: {
          orient: 'vertical',
          right: calcFontSize(10),
          top: 'center',
          itemWidth: calcFontSize(10),
          itemHeight: calcFontSize(10),
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          formatter: (name) => {
            const item = resultData.value.find(data => data.name === name)
            if (item) {
              return `${name}  ${item.value}个`
            }
            return name
          }
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            center: ['35%', '50%'],
            avoidLabelOverlap: true,
            data: resultData.value,
            
          label: {
            show: true,
            position: 'inside',
            formatter: (params): string => {
              const percentage = params.data.ratio ? params.data.ratio.toFixed(0) : 0
              return `${percentage}%`
            },
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 15,
            padding: [0, -5, 0, -5], // 减少内边距，使文字更紧凑
            distance: calcFontSize(5), // 减少标签到图形的距离
            overflow: 'none' // 确保文字不被截断
          },
          labelLine: {
            show: true,
            smooth: 0.2,
            length: calcFontSize(12), // 减少第一段引导线长度
            length2: calcFontSize(12) // 减少第二段引导线长度
          },
          }
        ]
      }
      chartInstance.setOption(option)
    }
    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value as HTMLElement)
        updateChart()
      }
    }
    const handleResize = () => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        initChart()
      }, 1000);
    }

    onMounted(async () => {
      await nextTick()
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="培训人数占比">
        <div class={['card-container-3']} >
          {resultData.value.length === 0 || resultData.value.every(item => item.value === 0 || item.value == null) && <NoData />}
          <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})