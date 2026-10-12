import { nextTick, watch, onMounted, ref, defineComponent } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, PictorialBarChart } from 'echarts/charts'
import styles from './style/pie-guidance.module.less'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components'
import 'echarts-liquidfill'
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart, PieChart])
export default defineComponent({
  name: 'pie-guidance',
  props: {
    yData: {
      type: Array,
      required: true,
    },
  },
  setup (props) {
    const powerFactorRef = ref()
    let myChart: echarts.ECharts | null = null
    const option = {
      title: {
        text: '',
        left: 'center',
        textStyle: {
          color: '#999',
          fontWeight: 'normal',
          fontSize: 14
        }
      },
      legend: {
        bottom: '0px', // 修改legend距离底部的距离为10px
        left: 'center',
        textStyle: {
          color: '#fff', // 图例文字颜色
        },
      },
      grid: { // 网格
        left: '3%', // 组件离容器左侧的距离
        right: '8%', // 组件离容器右侧的距离
        bottom: '0%', // 组件离容器下侧的距离
        top: '0%',
      },
      series: {
        type: 'pie',
        radius: [40, 60],
        top: '1%',
        height: '100%',
        left: 'center',
        width: 300,
        label: {
          alignTo: 'edge',
          formatter: '{name|{b}}\n{time|{d} %}',
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
          color: '#fff',
          rich: {
            time: {
              fontSize: 10,
              color: '#fff'
            }
          }
        },
        data: props.yData,
      }
    }
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option)
    }
    nextTick(() => {
      const container = powerFactorRef.value as HTMLElement
      if (container) initChart(container)
    })
    watch(() => [...props.yData], () => { initChart(powerFactorRef.value) }, { deep: true })
    onMounted(() => {
      initChart(powerFactorRef.value)
    })
    return () => <div class={styles['power-factor']} ref={powerFactorRef} />
  },
})
