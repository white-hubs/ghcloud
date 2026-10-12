import { defineComponent, watch, ref, onMounted, type PropType } from 'vue'
import * as echarts from 'echarts'
import '../line-chart/chart.less'
// 堆叠柱状图
export const StackedBar = defineComponent({
  props: {
    xData: {
      type: Array as PropType<string[]>,
      default: () => ['隐患', '故障', '巡检', '维保', '委外', '改造']
    },
    yData: {
      type: Array as PropType<{ name: string;value: number[];color?: string; }[]>,
      default: () =>
        [
          { name: '已处理', value: [10, 10, 8, 6, 16, 10, 12], color: '#2AE8BD' },
          { name: '处理中', value: [10, 10, 8, 6, 16, 10, 12], color: '#2989FF' },
        ]
    },
  },
  setup: (props) => {
    const chart = ref()
    const setOptions = (): void => {
      const option = {
        legend: {
          itemWidth: 10,
          itemHeight: 10,
          padding: [10, 0, 0, 0],
          data: props.yData.map(e => {
            return {
              name: e.name,
              textStyle: {
                color: '#A5B6DA',
                fontSize: 12
              }
            }
          })
        },
        tooltip: {
          show: true,
          formatter: (data: { value: number;name: string;seriesName: string; }) => {
            return data.value === 0 ? data.name : data.name + ' ' + data.seriesName + ':' + data.value
          }
        },
        grid: {
          left: '0%',
          right: '10px',
          bottom: '0',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: props.xData,
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed', // 虚线
              color: ['rgba(255,255,255,0.15)'],
              width: 1,
            },
            show: true, // 隐藏
          },
          axisLabel: {
            showMaxLabel: true,
            show: true,
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 300,
          },
        },
        series: props.yData.map(e => {
          return {
            name: e.name,
            type: 'bar',
            stack: 'stack',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              normal: { color: e.color }
            },
            barWidth: 15,
            data: e.value,
            z: -2,
          }
        })
      }
      const myChart = echarts.init(chart.value)
      myChart.clear()
      myChart.setOption(option)
      myChart.resize()
    }
    watch(
      () => [...props.xData],
      () => {
        setOptions()
      },
      { deep: true }
    )
    onMounted(() => {
      setOptions()
    })
    return () => (
      <div class='chart' ref={chart} />
    )
  }
})
