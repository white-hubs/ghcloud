import { ref, defineComponent, type PropType, nextTick, defineExpose, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LegendComponent, GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import { LineChart, type LineSeriesOption, BarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

  <template />
interface SeriesItf {
  name?: string;
  data?: number[];
  linearGradientColor?: string[];
  smooth?: boolean;
  showSymbol?: boolean;
  lineColor?: string;
  symbolSize?: number;
  type?: string;
}
export default defineComponent({
  name: 'line-chart',
  props: {
    legendPosition: {
      type: String,
      default: 'bottom'
    },
    colors: {
      type: Array as PropType<string[]>,
      default: ['#568EFF', '#78FCFC', '#FFC700', '#F14545']
    },
    gridTop: {
      type: String,
      default: '20'
    },
    titles: {
      type: Array as PropType<string[]>,
      default: []
    },
    legendFontSize: {
      type: Number,
      default: 12
    },
    xData: {
      type: Array as PropType<string[] | number[]>,
      default: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    series: {
      type: Array as PropType<SeriesItf[]>,
      default: []
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    unit: {
      type: Object as PropType<{ x: string; y: string; }>,
      default: { x: '', y: '' }
    },
    axisPointer: {
      type: Boolean,
      default: false
    },
  },
  setup: (props) => {
    const chartDom = ref()
    echarts.use([BarChart])
    echarts.use([
      GridComponent,
      LineChart,
      CanvasRenderer,
      UniversalTransition,
      TooltipComponent,
      LegendComponent,
      TitleComponent
    ])
    const option = {
      title: {
        text: props.title,
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      tooltip: {
        trigger: 'axis',
        // axisPointer: { type: props.axisPointer ? 'shadow' : '' }, // cross 十字准星指示器 / shadow 阴影指示器
        backgroundColor: 'rgba(3, 11, 27, 0.70)',
        borderColor: 'rgba(3, 11, 27, 0.70)',
        textStyle: {
          color: 'white',
        },
      },
      legend: {
        y: 'bottom',
        show: props.showLegend,
        width: '100%',
        itemHeight: 10,
        data: props.titles,
        textStyle: {
          fontSize: props.legendFontSize, // 字体大小
          color: '#D0DEEE', // 字体颜色
        },
      },
      grid: {
        left: '10px',
        right: '5%',
        bottom: '15%',
        top: props.gridTop + '%',
        containLabel: true,
      },
      color: props.colors,
      xAxis: [
        {
          type: 'category',
          boundaryGap: true,
          data: props.xData,
          axisLabel: {
            interval: 'auto',
            showMaxLabel: true,
            show: true,
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 300
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#fff',
              width: 0,
            }
          },
          name: props.unit.x,
          nameLocation: 'end',
          nameTextStyle: {
            fontSize: 12,
            verticalAlign: 'middle',
            align: 'right',
            padding: [0, 5, 0, 0]
          },
          animationEasing: 'cubicOut'
        },
      ],
      yAxis: [
        {
          minInterval: 1,
          type: 'value',
          name: props.unit.y,
          nameTextStyle: {
            fontSize: 12,
            color: '#ffffff',
            fontWeight: 300,
            verticalAlign: 'middle',
            align: 'right',
            padding: [0, 0, 0, 5],
          },
          splitLine: {
            lineStyle: {
              type: 'dashed', // 虚线
              color: ['rgba(255,255,255,0.15)'],
              width: 1,
            },
            show: true, // 隐藏
          },
          axisLabel: {
            show: true,
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 300
          },
          animationEasing: 'cubicOut'
        },
      ],
      series: props.series.map((e: SeriesItf) => {
        const item: LineSeriesOption | any = {
          name: e.name ?? null,
          type: e.type ? e.type : 'line',
          symbol: 'circle',
          smooth: e.smooth === undefined ? true : e.smooth,
          showSymbol: e.showSymbol,
          symbolSize: 5.5,
          data: e.data,
          lineStyle: {
            width: 1.5,
          },
          itemStyle: {
            normal: {
              color: e.lineColor ?? e.linearGradientColor ? e.linearGradientColor?.[0] : '',
            },
          },
        }
        if (e.linearGradientColor && e.linearGradientColor.length === 2) {
          // 设置了渐变色
          item.areaStyle = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: e.linearGradientColor[0],
              },
              {
                offset: 1,
                color: e.linearGradientColor[1],
              },
            ]),
          }
        }
        return item
      }),
    }
    let myChart: echarts.ECharts | null = null
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option)
    }
    nextTick(() => {
      const container = chartDom.value as HTMLElement
      if (container) initChart(container)
    })

    watch(
      () => [...props.series],
      () => {
        initChart(chartDom.value)
      }
    )
    watch(
      () => props.unit,
      () => {
        if (chartDom.value)initChart(chartDom.value)
      }
    )
    watch(
      () => props.legendPosition,
      () => {
        option.legend.y = props.legendPosition
        initChart(chartDom.value)
      }, { deep: true }
    )
    const render = (): void => {
      myChart?.dispose()
      const container = chartDom.value as HTMLElement
      initChart(container)
    }
    defineExpose({
      render
    })

    return () => <div style={{ width: '100%', minHeight: '180px', padding: '10px 0', height: '100%' }} ref={chartDom} />
  }
})
