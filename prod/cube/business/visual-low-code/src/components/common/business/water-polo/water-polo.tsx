import { nextTick, watch, onMounted, ref, defineComponent } from 'vue'
import * as echarts from 'echarts/core'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import 'echarts-liquidfill'
export default defineComponent({
  name: 'water-polo',
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    // 水球图背景颜色
    bgColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0)',
    },
    // 波纹的颜色
    color: {
      type: String,
      default: '#20a5ff',
    },
    // 单位
    unit: {
      type: String,
      default: '',
    },
  },
  setup (props) {
    echarts.use([
      LegendComponent,
      TooltipComponent,
      TitleComponent
    ])
    const powerFactorRef = ref()
    nextTick(() => {
    // 2. 容器
      const container = powerFactorRef.value as HTMLElement
      if (container) initChart(container)
    })
    // 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
    let myChart: echarts.ECharts | null = null
    const option = {
      title: {
        text: props.title,
        x: '40%',
        y: '88%',
        textStyle: {
          fontSize: 14,
          fontWeight: '100',
          color: '#fff',
          lineHeight: 16,
          textAlign: 'center',
        },
      },

      series: [
        {
          type: 'liquidFill',
          radius: '100%',
          center: ['50%', '50%'],
          color: [
            {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: props.color,
                },
                {
                  offset: 1,
                  color: props.color,
                },
              ],
              globalCoord: false,
            },
          ],
          data: [props.value, 0.5, 0.5], // data个数代表波浪数
          backgroundStyle: {
            borderWidth: 10,
            color: props.bgColor,
          },
          label: {
            // show:false,
            fontSize: 30,
            color: '#fff',
            formatter: '{c}' + props.unit,
          },
          outline: {
            show: false,
            borderDistance: 0,
            itemStyle: {
              borderWidth: 2,
              borderColor: '#fff',
            },
          },
        },
      ],
    }
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option)
    }
    watch(
      () => props.value,
      () => {
        initChart(powerFactorRef.value)
      },
    )
    onMounted(() => {
      initChart(powerFactorRef.value)
    })

    return () => <div style={{ width: '154px', height: '154px' }} ref={powerFactorRef} />
  }
})
