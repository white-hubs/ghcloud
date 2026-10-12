import { defineComponent, onMounted, shallowRef, watch, type PropType } from 'vue'
import { createUniqueId } from '@/utils'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { useUtils } from '@/hook/use-utils'
interface DataVo {
  name: string;
  value: number;
}
const colorList = ['#2B7FFF', '#2AE8BD', '#57B6F7']
export const CircularChart = defineComponent({
  props: {
    id: {
      type: String,
      default: () => createUniqueId()
    },
    dataList: {
      type: Array as PropType<DataVo[]>,
      default: () => []
    }
  },
  setup: (props) => {
    const myChart = shallowRef<ECharts>()
    const getDotData = (): {
      name: string;
      value: number;
      itemStyle: {
        normal: {
          color: string;
          borderWidth: number;
          borderColor: string;
        };
      };
    }[] => {
      const dataArr = []
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          dataArr.push({
            name: (i + 1).toString(),
            value: 25,
            itemStyle: {
              normal: {
                color: 'rgba(107,167,255,0.21)',
                borderWidth: 0,
                borderColor: 'rgba(0,0,0,0)'
              }
            }
          })
        } else {
          dataArr.push({
            name: (i + 1).toString(),
            value: 20,
            itemStyle: {
              normal: {
                color: 'rgba(0,0,0,0)',
                borderWidth: 0,
                borderColor: 'rgba(0,0,0,0)'
              }
            }
          })
        }
      }
      return dataArr
    }
    useUtils()
    const renderCharts = (): void => {
      if (!myChart.value) return
      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['80%', '90%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: props.dataList.map((item, index) => {
              return {
                value: item.value,
                name: item.name,
                itemStyle: {
                  color: colorList[index]
                }
              }
            })
          },
          {
            type: 'pie',
            silent: true,
            radius: ['99%', '100%'],
            label: {
              normal: {
                show: false
              },
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: getDotData()
          },
          // {
          //   type: 'pie',
          //   radius: [0, '60%'],
          //   hoverAnimation: false,
          //   clockWise: false,
          //   itemStyle: {
          //     normal: {
          //       shadowBlur: 4,
          //       shadowColor: '#2b7bf1',
          //       borderWidth: 1,
          //       opacity: 0.2,
          //       borderColor: 'rgba(42,123,241,0.50)'
          //     }
          //   },
          //   label: {
          //     normal: {
          //       formatter: () => {
          //         return '日出货量'
          //       },
          //       position: 'center',
          //       show: true,
          //       color: '#D0DEEE',
          //       fontSize: 5
          //     }
          //   },
          //   tooltip: {
          //     trigger: 'item',
          //     show: false,
          //   },
          //   data: [100]
          // },
        ]
      }
      myChart.value.setOption(option)
    }
    // watch(() => props.value, () => {
    //   renderCharts()
    // })
    onMounted(() => {
      myChart.value = echarts.init(document.getElementById(props.id) as HTMLDivElement)
      window.addEventListener('resize', () => {
        myChart.value?.resize()
      })
      renderCharts()
    })
    watch(() => props.dataList, () => {
      renderCharts()
    })
    return (): JSX.Element=> (
      <div id={props.id} style='height: 100%;' />
    )
  }
})
