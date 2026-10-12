import {
  defineComponent,
  onUnmounted,
  onMounted,
  nextTick,
  computed,
  markRaw,
  watch,
  ref,
} from 'vue'
import * as echarts from 'echarts'

export const LineModel = defineComponent({
  props: {
    totalNum: [String, Number],
    name: String,
    data: {
      type: Object,
      default: () => {},
    },
    center: {
      default: () => ['50%', '50%'],
      type: Array,
    },
    radius: {
      default: () => ['50%', '62%'],
      type: Array,
    },
    clockwise: Boolean,
    startAngle: Number,
    hideTitle: Boolean,
  },
  setup: (props) => {
    const chartBox = ref()
    const chart = ref()

    const options = computed(() => {
      return {
        title: props.data?.title ? props.data?.title : [],
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: props.data?.legend ? props.data?.legend : [],
        },
        grid: {
          left: '8px',
          right: '16px',
          bottom: '8px',
          top: '32px',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: props.data?.boundaryGap
            ? props.data?.boundaryGap
            : false,
          data: props.data?.xAxisData ? props.data?.xAxisData : [],
        },
        yAxis: {
          type: 'value',
        },
        series: props.data?.series ? props.data?.series : [],
      }
    })

    // 图标初始化
    const initChart = (): void => {
      // markRaw 禁止为响应式数据
      chart.value = markRaw(echarts.init(chartBox.value))
    }
    // 图标数据渲染
    const renderChart = (): void => {
      nextTick(() => {
        chart.value.setOption(options.value)
        // chart.value.resize();
      })
    }

    const echartsResize = (): void => {
      if (chart.value) {
        chart.value.resize()
      }
    }

    onMounted(() => {
      initChart()
      renderChart()
      window.addEventListener('resize', echartsResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', echartsResize)
    })

    // 监听props里面的data的数据变化
    watch(
      () => props.data,
      () => {
        if (chart.value) {
          renderChart()
        }
      },
      { deep: true }
    )

    return () =>
      <div
        ref={chartBox}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
  },
})
