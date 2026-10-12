import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
  nextTick,
  type PropType,
  ref
} from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface ChartItem {
  name: string;
  value: number;
}

export const Line = defineComponent({
  name: 'LineChart',
  props: {
    lineStyleColor: {
      type: String,
      default: 'rgba(0, 186, 139,1)',
    },
    areaStyleColor: {
      type: String,
      default: 'rgba(0, 186, 139, 0.05)',
    },
    chartData: {
      type: Array as PropType<ChartItem[]>,
      default: () => [],
    },
    type: {
      type: String as PropType<'line' | 'bar'>,
      default: 'line',
    },
    dayType: {
      type: String,
      default: 'TODAY',
    },
    yName: {
      type: String,
      default: '',
    },
  },
  setup (props) {
    const chartRef = ref<HTMLElement>()
    let myChart: ECharts | null = null

    const baseOptions = reactive({
      grid: {
        left: 50,
        right: 10,
        bottom: 50,
        top: 30,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      xAxis: {
        type: 'category',
        data: [] as (string[] | number[]),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: (value: string) =>
            props.dayType === 'TODAY' ? `${value}时` : value
        },
      },
      yAxis: {
        type: 'value',
        name: props.yName,
        minInterval: 1,
        axisLabel: {
          formatter: (value: number) => `${value}个`,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#F3F3F3',
          },
        },
      },
      series: [{
        type: props.type,
        data: [] as number[],
        symbol: 'circle',
        barWidth: 10,
        itemStyle: {
          color: props.lineStyleColor,
        },
        lineStyle: {
          color: props.lineStyleColor,
        },
        areaStyle: {
          color: props.areaStyleColor,
        },
        smooth: true,
      }],
    })

    const updateChartData = (): void => {
      const xData = props.chartData.map(item => item.name)
      const seriesData = props.chartData.map(item => item.value)

      baseOptions.xAxis = {
        ...baseOptions.xAxis,
        data: xData,
      }

      if (baseOptions.series?.[0]) {
        (baseOptions.series[0]).data = seriesData
      }

      myChart?.setOption(baseOptions)
    }

    watch(() => props.chartData, updateChartData, { deep: true })

    onMounted(() => {
      nextTick(() => {
        if (chartRef.value) {
          myChart = echarts.init(chartRef.value)
          updateChartData()
        }
      })

      const resizeHandler = (): void => myChart?.resize()
      window.addEventListener('resize', resizeHandler)

      onBeforeUnmount(() => {
        window.removeEventListener('resize', resizeHandler)
        myChart?.dispose()
      })
    })

    return (): JSX.Element => (
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '300px',
        }}
      />
    )
  },
})
