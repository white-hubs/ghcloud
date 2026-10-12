import { defineComponent, nextTick, onBeforeMount, onMounted, reactive, watch, type PropType } from 'vue'
import * as echarts from 'echarts'
import moment from 'moment'
interface HistoryData { 
  changed: boolean;
  key: string;preValue: number;
  ts: number;
  value: number; 
}
export const HistoryLineChart = defineComponent({
  props: {
    historyData: {
      type: Array,
      default: [],
    },
    deviceData: {
      type: Array as PropType<{ label: string;value: string;dataType: string; }[]>,
      default: [],
    },
  },
  setup (props) {
    const state = reactive<{ 
      colorArr: string[];
      historyChangeData: HistoryData[][]; }>({
      colorArr: ['#1890FF', '#09D6A3'],
      historyChangeData: [],
    })
    const initEchart = async (): Promise<void> => {
      const chartDom = document.getElementsByClassName('lineChart')
      const xData: string[] = []
      const yData: number[] = []
      for (let i = 0; i < chartDom.length; i++) {
        const myChart = echarts.init(chartDom[i] as HTMLElement)
        let option
        if (i % 2) {
          state.colorArr[i] = '#1890FF'
        } else {
          state.colorArr[i] = '#09D6A3'
        }

        if (state.historyChangeData.length > 0) {
          // 排序一次
          state.historyChangeData[i].sort((a, b) => {
            return a.ts - b.ts
          })
          state.historyChangeData[i].forEach((item) => {
            xData.push(moment(item.ts).format('YYYY-MM-DD HH:mm:ss'))
            yData.push(item.value)
          })
          option = {
            tooltip: {
              trigger: 'axis',
            },
            grid: {
              top: '8%',
              left: '4%',
              right: '5%',
              bottom: '6%',
              containLabel: true,
            },
            toolbox: {
              feature: {},
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xData,
              // position: 'bottom',

              axisLabel: {
                align: 'center'
              }
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
            yAxis: {
              type: 'value',
              boundaryGap: [0, '100%'],
            },

            series: [
              {
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                  color: state.colorArr[i],
                  lineStyle: {
                    width: 1,
                  },
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: state.colorArr[i],
                    },
                    {
                      offset: 1,
                      color: '#fff',
                    },
                  ]),
                },
                data: yData,
              },
            ],
          }

          myChart.setOption(option)
        }
      }
    }
    watch(
      () => props.historyData,
      (n) => {
        state.historyChangeData = Object.values(n) as HistoryData[][]
        nextTick(() => {
          initEchart()
        })
      },
      { immediate: true, deep: true }
    )
  
    onBeforeMount(() => {
      // 2.组件挂载页面之前执行----onBeforeMount
    })
    onMounted(() => {
      // 3.组件挂载到页面之后执行-------onMounted
      nextTick(() => {
        state.historyChangeData = props.historyData as HistoryData[][] 
        initEchart()
      })
    })
    return (): JSX.Element =>
      <>
        {
          state.historyChangeData.length > 0
            ? state.historyChangeData.map((item, index) =>
              <div key={index}>
                <div class='item-title'>{`历史${item[0]?.key ? props?.deviceData.find((res: { value: string;label: string; }) => res.value === item[0].key)?.label : ''}数据`}</div>
                <div class='lineChart' style='width: 100%; height: 280px' />
              </div>)
            : <a-empty />
        }
      </>
  }
})
