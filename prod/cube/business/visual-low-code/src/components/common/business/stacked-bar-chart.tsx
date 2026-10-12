import { nextTick, watch, onMounted, ref, defineComponent, type PropType } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, PictorialBarChart } from 'echarts/charts'

import { CanvasRenderer } from 'echarts/renderers'

import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components'
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart, PieChart, CanvasRenderer])
export default defineComponent({
  name: 'stacked-bar-chart',
  props: {
    yData: {
      type: Array as PropType<{ name: string; data: number[]; color: string; }[]>,
      default: () => []
    },
    xData: {
      type: Array,
      default: () => []
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    legendPosition: {
      type: String,
      default: 'bottom'
    },
    labelFormatter: {
      type: Function,
      default: () => { return () => {} }
    },
    showLabel: {
      type: Boolean,
      default: false
    },
    labelPosition: {
      type: String,
      default: 'right'
    },
  },
  setup (props) {
    const series = props.yData.map(x => {
      return {
        name: x.name,
        type: 'bar',
        stack: 'total', // 数据堆叠
        label: { // 图形上的文本标签
          position: props.labelPosition,
          show: props.showLabel, // 是否显示标签
          formatter: props.labelFormatter,
        },
        itemStyle: {
          color: x.color,
        },
        emphasis: { // 高亮的图形样式和标签样式
          focus: 'series'// 聚焦当前高亮的数据所在的系列的所有图形
        },
        data: x.data
      }
    })
    const option = ref({
      tooltip: { // 提示框
        trigger: 'axis', // 坐标轴触发
        axisPointer: { // 坐标轴指示器配置项
          // Use axis to trigger tooltip
          type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow',阴影类型
        }
      },
      legend: {
        itemWidth: 15, // 图例标记的图形宽度
        itemHeigh: 2, // 图例标记的图形高度
        show: props.showLegend,
        textStyle: {
          color: '#fff'
        },
        y: 'bottom'
      }, // 图例
      grid: { // 网格
        left: '3%', // 组件离容器左侧的距离
        right: '20%', // 组件离容器右侧的距离
        bottom: props.showLegend ? '15%' : '5%', // 组件离容器下侧的距离
        top: '15%',
        containLabel: true// 区域是否包含坐标轴的刻度标签
      },
      xAxis: {
        type: 'value', // 坐标轴类型：数值轴
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed', // 虚线
            color: ['rgba(255,255,255,0.3)'],
            width: 1,
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#fff',
            width: 0,
            type: 'solid'
          }
        },
      },
      yAxis: {
        type: 'category', // 坐标轴类型：类目轴
        data: props.xData,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#fff',
            width: 0,
            type: 'solid'
          }
        },
      },
      series
    })
    const powerFactorRef = ref()
    let myChart: echarts.ECharts | null = null
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option.value)
    }
    watch(
      () => [...props.yData, ...props.xData],
      () => {
        option.value.yAxis.data = props.xData
        initChart(powerFactorRef.value)
      }, { deep: true }
    )
    watch(
      () => [...props.legendPosition],
      () => {
        option.value.legend.y = props.legendPosition
        initChart(powerFactorRef.value)
      }, { deep: true }
    )
    nextTick(() => {
    // 2. 容器
      const container = powerFactorRef.value as HTMLElement
      if (container) initChart(container)
    })
    onMounted(() => {
      initChart(powerFactorRef.value)
    })
    return () => <div style={{ width: '100%', height: '100%' }} ref={powerFactorRef} />
  }
})
