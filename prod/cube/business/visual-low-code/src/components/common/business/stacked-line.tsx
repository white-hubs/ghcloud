import { nextTick, watch, ref, defineComponent, type PropType } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components'
import 'echarts-liquidfill'
import type { ZRColor, ECBasicOption, CallbackDataParams } from 'echarts/types/dist/shared'
type ScaleDataValue = ParsedValueNumeric | OrdinalRawValue | Date
type OrdinalRawValue = string | number
type ParsedValueNumeric = number | OrdinalNumber
type OrdinalNumber = number
interface LabelFormatterParams {
  color: string;
  axisValue: string;
  seriesName: string;
  value: ScaleDataValue;
  axisDimension: string;
  axisIndex: number;
  seriesData: CallbackDataParams[];
}
interface YDataType {
  data: number[];
  name: string;
  colors: { offset: number; color: string; }[];
}
export default defineComponent({
  name: 'stacked-line',
  props: {
    title: {
      type: String,
      required: true,
    },
    xData: {
      type: Array,
      required: true,
    },
    yData: {
      type: Array as PropType<YDataType[]>,
      required: true,
    },
    smooth: {
      type: Number,
    },
    color: {
      type: Array as PropType< ZRColor | ZRColor[]>,
    },
  },
  setup: (props) => {
    const powerFactorRef = ref()
    echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart])
    const setOption = (): ECBasicOption => {
      const max = []
      const arr = props.yData.map((item: YDataType) => {
        max.push(Math.max.apply(null, item.data))
        const data = {
          type: 'line',
          symbol: 'none',
          name: item.name,
          smooth: 0.2,
          emphasis: {
            focus: 'series',
          },
          areaStyle: {},
          lineStyle: {},
          data: item.data,
        }
        if (item.colors) {
          data.areaStyle = {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, item.colors),
          }
          data.lineStyle = {
            color: item.colors[0],
            width: 0,
          }
        }
        return data
      })
      let interval = 0
      if (props.xData.length > 12 && props.xData.length <= 24) {
        interval = 2
      } else if (props.xData.length > 12) {
        interval = 3
      } else if (props.xData.length > 24) {
        interval = 4
      }
      const option: ECBasicOption = {
        color: props.color ?? '',
        title: {
          text: props.title,
          top: -30,
          // left:10,
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          padding: [30, 0, 0, 10],
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params: LabelFormatterParams[]) {
            let dom = ''
            params.forEach((item) => {
              dom += `<div>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
            <span>${item.seriesName}:</span>
            <span>${item.value}</span>
            <span>${props.title}</span>
            </div>`
            })
            return `<div>${params[0].axisValue}</div>` + dom
          }
        },
        legend: {
          bottom: 0,
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: 30,
          top: 20,
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: props.xData,
            axisLine: {
              lineStyle: {
                color: '#fff',
              },
            },
            axisLabel: {
              interval,
              show: true,
              textStyle: {
                fontSize: 10,
              },
              showMaxLabel: true,
            },
          },
        ],
        yAxis: [
          {
            minInterval: 1,
            type: 'value',
            // max: Math.max.apply(null, max) + 1,
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed', // 虚线
                color: ['rgba(255,255,255,0.3)'],
                width: 1,
              },
            },
            axisLabel: {
              // y轴文字的配置
              textStyle: {
                color: '#fff',
              },
            },
          },
        ],
        series: arr
      }
      return option
    }
    let myChart: echarts.ECharts | null = null
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(setOption())
    }
    nextTick(() => {
      const container = powerFactorRef.value as HTMLElement
      if (container) initChart(container)
    })

    // onMounted(() => {
    //   initChart(powerFactorRef.value)
    // })
    watch(
      () => [...props.xData],
      () => {
        initChart(powerFactorRef.value)
      }
    )
    return () => <div style={{ width: '100%', height: '100%' }} ref={powerFactorRef} />
  }
})
