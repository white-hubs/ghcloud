import { defineComponent, nextTick, onBeforeMount, onMounted, reactive, watch, type PropType } from 'vue'
import * as echarts from 'echarts'
interface PropertyHistoryVosType {
  ts: string;
  value: number;
}
interface HistoryData { 
  attributeName: string;
  name: string;
  propertyHistoryVos: PropertyHistoryVosType[];

}
export const HistoryLineChartE = defineComponent({
  props: {
    historyData: {
      type: Array as PropType<HistoryData[]>,
      default: () => [],
    },
  },
  setup (props) {
    const state = reactive<{ historyChangeData: HistoryData[]; }>({
      historyChangeData: [],
    })
    const initEchart = async (): Promise<void> => {
      const chartDom = document.getElementsByClassName('lineChart')
      const myChart = echarts.init(chartDom[0] as unknown as HTMLElement)
      myChart.setOption({
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
          data: state.historyChangeData[0].propertyHistoryVos.map(res => res.ts)
        },

        series: state.historyChangeData.map(res => {
          return {
            name: res.attributeName,
            type: 'line',
            itemStyle: {
              color: '#09D6A3',
              lineStyle: {
                width: 1,
              },
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#09D6A3'
                },
                {
                  offset: 1,
                  color: '#fff',
                },
              ]),
            },
            data: res.propertyHistoryVos.map(res => res.value)
          }
        }),

      })
    }
    watch(
      () => props.historyData,
      n => {
        state.historyChangeData = n 
        nextTick(() => {
          initEchart()
        })
      },
      { immediate: true, deep: true },
    )
  
    onBeforeMount(() => {
      // 2.组件挂载页面之前执行----onBeforeMount
    })

    onMounted(() => {
      // 3.组件挂载到页面之后执行-------onMounted
      nextTick(() => {
        state.historyChangeData = props.historyData 
        
        initEchart()
      })
    })
    return (): JSX.Element =>
      <>
        {
          state.historyChangeData.length > 0
            ? <> <div class='item-title'>{`历史${state.historyChangeData[0].name}数据`}</div><div class='lineChart' style='width: 100%; height: 280px' /></>
            : <a-empty />
        }
      </>
  }
})
