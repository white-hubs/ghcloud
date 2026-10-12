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
  alarmNum: number;
}

export const Bar = defineComponent({
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
  },
  setup (props) {
    const chartRef = ref<HTMLElement>()
    let myChart: ECharts | null = null

    const state = reactive({
      options: {
        grid: {
          left: 50,
          right: 10,
          bottom: 50,
          top: 10,
          containLabel: false,
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: { marker: string; name: string; value: string; }[]) => {
            const param = params[0]
            return `个数<br/>${param?.marker}${param?.name} : ${param?.value?.toLocaleString()}个`
          },
          axisPointer: {
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          data: [] as string[],
          axisLine: { show: false },
          axisLabel: { interval: 0 },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
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
          data: [] as number[],
          type: 'bar',
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
        }],
      },
    })

    const updateChartData = (): void => {
      state.options.xAxis.data = props.chartData.map(item => item.name);
      (state.options.series[0]).data = props.chartData.map(item => item.alarmNum)

      if (myChart) {
        myChart.setOption(state.options)
      }
    }

    watch(() => props.chartData, updateChartData)

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
        style={{ width: '100%', height: '100%' }}
      />
    )
  },
})
