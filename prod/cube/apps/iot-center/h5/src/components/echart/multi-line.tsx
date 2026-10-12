import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: {}
    },
    rotate: { // x轴倾斜角度
      type: Number,
      default: 60
    },
  },
  setup: (props, context) => {
    const myChart = ref()
    const line = ref()
    const render = (): void => {
      const option = {
        legend: {
          data: props.data.attributeName
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value'
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            height: 20,
            left: '10%',
            right: '10%',
            bottom: '2%',
            start: 0,
            end: 50,

            textStyle: {
              color: '#d4ffff',
              fontSize: 11,
            },
          },
          {
            type: 'inside',
            moveOnMouseWheel: false,
            zoomOnMouseWheel: false,
          },

        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: props.data.propertyHistoryVos.map((res: { ts: string; }) => res.ts),
          axisLabel: {
            width: 150,
            overflow: 'truncate',
            rotate: props.rotate
          },
        },

        series: {
          name: props.data.attributeName,
          type: 'line',
          data: props.data.propertyHistoryVos.map((res: { value: string; }) => res.value)
        }
        ,

      }
      myChart.value = echarts.init(line.value)
      option && myChart.value.setOption(option)
    }
    onMounted(() => {
      render() 
    })
    watch(() => props.data, () => {
      render()
    })
    context.expose({
      render
    })
    return (): JSX.Element =>
      <>
        <div id='line' ref={line} style='width:100%;height:100%' />
      </>
  }
})
