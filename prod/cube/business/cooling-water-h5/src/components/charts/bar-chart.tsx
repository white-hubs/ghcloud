import { defineComponent, ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import './chart.less'
// 条形图
export const BarChart = defineComponent({
  props: {
    categoryData: {
      type: Array,
      default: () => ['南昌', '深圳', '长沙', '福田', '平湖', '成都']
    },
    series: {
      type: Array,
      default: () =>
        [
          {
            name: '2011',
            type: 'bar',
            barWidth: 12,
            itemStyle: {
              normal: {
                color: '#568CFF'
              }
            },
            data: [23, 34, 35, 36, 45, 48]
          }
        ]
    },
    yAxisOptions: {
      type: Array,
      default: () => {
        return [{
          type: 'value',
          axisLabel: {
            color: '#A2A2A7'
          },
          splitLine: {
            show: true,
            color: '#f8f8f8',
            lineStyle: {
              type: 'dashed'
            },
          },
          boundaryGap: [0, 0.01]
        }]
      }

    }
  },
  setup: (props) => {
    const chart = ref()
    const setOptions = (): void => {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          x: 'center', // 可设定图例在左、右、居中
          y: '4%',
          show: true,
          itemWidth: 8,
          itemHeight: 8,
        },
        grid: {
          top: '16%',
          left: '0%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: props.yAxisOptions,
        xAxis: {
          type: 'category',
          axisLabel: {
            color: '#A2A2A7',
            interval: 0,
            rotate: 40,
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: props.categoryData
        },
        series: props.series
      }
      const myChart = echarts.init(chart.value)
      myChart.clear()
      myChart.setOption(option)
    }
    watch(() => props, () => {
      setOptions()
    }, { deep: true })
    onMounted(() => {
      setOptions()
    })

    return () => (
      <div class='chart' ref={chart} />
    )
  }
})
