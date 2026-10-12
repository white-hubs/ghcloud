import { computed, defineComponent, onMounted, ref, watch, type PropType } from 'vue'
import * as echarts from 'echarts'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import styles from './statistics-card.module.less'
import { CountTo } from 'vue3-count-to'

interface CategoryData {
  color: string;
  name: string;
  value: number;
}
/** 饼图 */
export const ElevatorAnalysisPie = defineComponent({
  props: {
    categoryData: {
      type: Array as PropType<CategoryData[]>,
      required: true,
      default: () => []
    }
  },
  setup (props) {
    const powerFactorRef = ref()
    let myChart: echarts.ECharts | null = null
    const initChart = (): void => {
      if (myChart) {
        myChart.dispose()
      }
      myChart = echarts.init(powerFactorRef.value)
      myChart.setOption(getOption())
      window.addEventListener('resize', () => {
        myChart?.resize()
      })
    }
    const getOption = (): ECBasicOption => {
      const option = {
        series: [
          {
            type: 'pie',
            radius: ['85%', '100%'],
            silent: true,
            clockwise: true,
            startAngle: 90,
            z: 0,
            zlevel: 0,
            label: {
              normal: {
                position: 'center',

              }
            },
            data: [
              {
                value: 88,
                itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
              },
              {
                value: 5,
                // 这里的5是按照总值/50计算出来的，背景色为透明
                itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
              },
              {
                value: 88,
                itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
              },
              {
                value: 5,
                // 这里的5是按照总值/50计算出来的，背景色为透明
                itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
              },
              {
                value: 88,
                itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
              },
              {
                value: 5,
                // 这里的5是按照总值/50计算出来的，背景色为透明
                itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
              },
              {
                value: 88,
                itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
              },
              {
                value: 5,
                // 这里的5是按照总值/50计算出来的，背景色为透明
                itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
              },
              {
                value: 88,
                itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
              },
              {
                value: 5,
                // 这里的5是按照总值/50计算出来的，背景色为透明
                itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
              },
              {
                value: 88,
                itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
              },
              {
                value: 5,
                // 这里的5是按照总值/50计算出来的，背景色为透明
                itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
              },

            ]
          },
          // 内容
          {
            name: 'Access From',
            type: 'pie',
            radius: ['70%', '80%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            data: props.categoryData.map(item => {
              return {
                value: item.value,
                name: item.name,
                itemStyle: {
                  color: item.color
                },
                originData: item
              }
            })
          }
        ]
      }
      return option
    }

    watch(() => props.categoryData, () => {
      initChart()
    }, { deep: true })
    const categoryData = computed(() => {
      const total = props.categoryData.reduce((prev, curr) => prev + curr.value, 0)
      return total
    })
    onMounted(() => {
      initChart()
    })
    return (): JSX.Element => (
      <div class={styles['chart-box']}>
        <div class={styles['chart-container']} ref={powerFactorRef} />
        <div class={styles['chart-content']}>
          <div class={styles['chart-content-value']}>
            <CountTo class={styles['statistics-count']} startVal={0} endVal={categoryData.value} duration={2000} separator=',' />
            <span class={styles['chart-content-unit']}>吨</span>
          </div>
          <div class={styles['chart-content-title']}>
            总重量
          </div>
        </div>
      </div>
    )
  }
})
