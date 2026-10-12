import { watch, onMounted, ref, defineComponent } from 'vue'
import * as echarts from 'echarts/core'
import 'echarts-liquidfill'
export const WaterPolo = defineComponent({
  name: 'water-polo',
  props: {
    data: {
      type: Number,
      default: 65,
    },
    title: {
      type: String,
      default: '',
    },
    max: {
      type: Number,
      default: 0,
    },
  },
  setup (props) {
    const powerFactorRef = ref(null)
    const setOptions = (): void => {
      const myChart = echarts.init(powerFactorRef.value)
      myChart.clear()
      myChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: function (res: { value: number; }) {
            return props.title + ': ' + (res.value / props.max).toFixed(2) + '㎡'
            // return '<span class="ii" style="background:' + res.color + ' "></span>' + res.name + ':<br/> ' + res.value;
          }
        },
        series: [{
          type: 'liquidFill',
          name: 'Liquid Fill1',
          radius: '80%',
          center: ['50%', '50%'],
          itemStyle: {
            opacity: 0.7,
            shadowBlur: 0
          },
          data: [
            {
              name: 'score',
              direction: 'right',
              value: (props.data / props.max).toFixed(2),
              itemStyle: {
                opacity: 1,
                normal: {
                  color: '#10B9FF',
                }
              },
            },
            {
              name: 'score',
              direction: 'right',
              value: (props.data / props.max).toFixed(2),
              itemStyle: {
                opacity: 1,
                normal: {
                  color: '#10B9FF',
                }
              },
            }
          ],
          backgroundStyle: {
            color: '#f3fbff',
          },
          label: {
            color: '#fff',
            normal: {
              textStyle: {
                fontSize: 30,
                color: '#333'
              },
              formatter: function () {
                return props.data + '㎡'
              }
            }
          },
          // 外部细圆
          outline: {
            show: true,
            borderDistance: 6, // 外部圆线距离水球的距离
            itemStyle: {
              borderWidth: 3,
              borderColor: '#10B9FF',
            }
          },
        }]
      })
    }
    onMounted(() => {
      setOptions()
    })
    watch(
      () => props.data,
      () => {
        setOptions()
      }
    )

    return () => <div style={{ width: '154px', height: '154px' }} ref={powerFactorRef} />
  }
})
