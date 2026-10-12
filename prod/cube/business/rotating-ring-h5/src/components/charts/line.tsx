import { defineComponent, onMounted, watch, nextTick, reactive } from 'vue'
import './chart.less'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { HistoryTable } from '@/views/history/components/history-table'
/** 报表统计 */
export const Line = defineComponent({
  props: {

    historyData: {
      type: Array,
      default: [],
    },
    deviceData: {
      type: Array,
      default: [],
    },
  },
  setup: (props) => {
    // const historyChangeData = ref<{ name: string; attributeName: string; }[]>([])
    const state = reactive<any>({
      colorArr: ['#1890FF', '#09D6A3'],
      historyChangeData: [],
      deviceData: []
    })

    watch(
      () => props.historyData,
      n => {
        Object.assign(state, {
          historyChangeData: Object.values(n),
          deviceData: props.deviceData
        })

        nextTick(() => {
          initEchart()
        })
      },
      { immediate: true, deep: true },
    )
    onMounted(() => {
      initEchart()
    })
    const initEchart = async (): Promise<void> => {
      const chartDom: any = document.getElementsByClassName('lineChart')
      const xdata: string[] = []
      const ydata: any[] = []
      for (let i = 0; i < chartDom.length; i++) {
        const myChart = echarts.init(chartDom[i])
        let option
        if (i % 2) {
          state.colorArr[i] = '#1890FF'
        } else {
          state.colorArr[i] = '#09D6A3'
        }

        if (state.historyChangeData.length > 0) {
          // for (const key in object) {
          //   state.historyChangeData
          // }
          state.historyChangeData[i].forEach((item: { ts: string | number | Date | dayjs.Dayjs | null | undefined; value: any; }) => {
            xdata.push(dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss'))
            ydata.push(item.value)
          })
          option = {
            tooltip: {
              trigger: 'axis',
            },
            grid: {
              top: '8%',
              left: '3%',
              right: '3%',
              bottom: '6%',
              containLabel: true,
            },
            toolbox: {
              feature: {},
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xdata,
              axisLabel: {
                color: '#A2A2A7'
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              },
            },
            yAxis: {
              type: 'value',
              boundaryGap: [0, '100%'],
            },
            dataZoom: [{
              type: 'slider',
              show: true,
              start: 0,
              end: 100
            }],
            series: [
              {
                name: state.historyChangeData[i].propertyName,
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
                data: ydata,
              },
            ],
          }

          myChart.setOption(option)
        }
      }
    }
    return () => (
      <div>
        {
     state.historyChangeData.map((item: any, index: number) => {
      
      let dataType = ''
      let device : { dataType: string; propName: string; dataConstraint: {value:any;label:string; }[] } = {
        dataType: '',
        propName: '',
        dataConstraint: []
      } 
      if(state.deviceData.length > 0) {
        device = state.deviceData.find((d: { propCode: string }) => d.propCode === Object.keys(props.historyData)[index]) ?? state.deviceData[0]
        dataType = device?.dataType
      }
      return (
         <div>
           {
            !['string','boolean','enum'].includes(dataType) ?
            <div key={index}>
              <div class='historytitle' style='font-size: 13px;margin-top: 8px;margin-bottom: 8px;margin-left: 4px;'>
                {`历史${device?.propName}数据`}
              </div>
              <div class='lineChart' style='width: 100%; height: 280px' />
            </div>
            :
            <HistoryTable historyData={props.historyData} deviceData={props.deviceData} style='margin-top:10px' />
           }
         </div>
       )
     })

      }
      </div>
    )
  },
})
