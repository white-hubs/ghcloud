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
export const classNumberStatistics = defineComponent({
  name: 'classNumberStatistics',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#F59E0B', '#10B981']
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
        const { wtbb_num = 0, shzyxy_num = 0, swdx_num = 0 } = res;
        const total = wtbb_num + shzyxy_num + swdx_num
        resultData.value = [
          {
            name: '市委党校',
            value: swdx_num ?? 0,
            ratio: swdx_num ? (swdx_num / total) * 100 : 0,
            itemStyle: { color: colors[0] }
          },
          {
            name: '社会主义学院',
            value: shzyxy_num ?? 0,
            ratio: shzyxy_num ? (shzyxy_num / total) * 100 : 0,
            itemStyle: { color: colors[1] }
          },
          {
            name: '委托办班',
            value: wtbb_num ?? 0,
            ratio: wtbb_num ? (wtbb_num / total) * 100 : 0,
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
            数量：${params.value}次<br/>占比：${percentage}%`
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
              return `${name}  ${item.value}次`
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
              return `${params.data.value}次`
            },
            color: '#ffffff',
            fontSize: calcFontSize(12),
            lineHeight: 15,
            padding: [0, -5, 0, -5], 
            distance: calcFontSize(5),
            overflow: 'none'
          },
          labelLine: {
            show: true,
            smooth: 0.2,
            length: calcFontSize(12),
            length2: calcFontSize(12)
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
      <SubPanelTemplate title="班次数量统计">
        <div class={['card-container-3']} >
        {resultData.value.length === 0 || resultData.value.every(item => item.value === 0 || item.value == null) && <NoData />}
        <div ref={chartRef} style="width: 100%; height: 100%" ></div>
        </div>
      </SubPanelTemplate>
    )
  }
})