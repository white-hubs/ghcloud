import { defineComponent, onMounted, ref, watch, onBeforeUnmount, type PropType } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { GaugeChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsType } from 'echarts'
import styles from './elevator-analysis-pie.module.less'

// 注册必要的组件
echarts.use([PieChart, GaugeChart, LegendComponent, TooltipComponent, TitleComponent, CanvasRenderer])

interface PieData {
  name: string;
  value: number;
  color: string;
}

export const ElevatorAnalysisPie = defineComponent({
  name: 'ElevatorAnalysisPie',
  props: {
    pieData: {
      type: Array as PropType<PieData[]>,
      default: () => []
    },
    class: {
      type: String,
      default: ''
    },
    pieClass: {
      type: String,
      default: ''
    },
    radius: {
      type: String,
      default: ''
    }
  },
  emits: ['clickbar'],
  setup(props, { emit, slots }) {
    const powerFactorRef = ref<HTMLElement | null>(null)
    let myChart: EChartsType | null = null
    
    const initChart = (container: HTMLElement): void => {
      if (myChart) {
        myChart.dispose()
      }
      myChart = echarts.init(container) as any
      myChart.off('click')
      myChart.on('click', (params) => {
        emit('clickbar', params)
      })
      myChart.setOption(getOption())
    }
    
    const getOption = () => {
      const option = {
        series: [
          // 背景圆环
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
                position: "center",
              }
            },
            data: [
              { value: 88, itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } } },
              { value: 5, itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } },
              { value: 88, itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } } },
              { value: 5, itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } },
              { value: 88, itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } } },
              { value: 5, itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } },
              { value: 88, itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } } },
              { value: 5, itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } },
              { value: 88, itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } } },
              { value: 5, itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } },
              { value: 88, itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } } },
              { value: 5, itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } },
            ]
          },
          // 仪表盘刻度线
          {
            type: 'gauge',
            name: '业务指标',
            radius: props.radius ? props.radius : `${180-(5/128*window.innerWidth)}%`,
            startAngle: '0',
            endAngle: '-359.99',
            splitNumber: '50',
            pointer: { show: false },
            title: { show: false },
            detail: { show: false },
            axisLine: {
              lineStyle: {
                width: 20,
                opacity: 0
              }
            },
            axisTick: { show: false },
            splitLine: {
              show: true,
              length: 5,
              lineStyle: {
                color: 'rgba(255,255,255,0.5)',
                width: 2,
                type: 'solid',
              },
            },
            axisLabel: { show: false }
          },
          // 数据饼图
          {
            name: 'Access From',
            type: 'pie',
            radius: ['70%', '80%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            data: props.pieData.map(item => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: item.color
              },
              originData: item
            }))
          }
        ]
      }
      return option
    }
    
    watch(
      () => [...props.pieData],
      () => {
        if (powerFactorRef.value) {
          initChart(powerFactorRef.value)
        }
      },
      { deep: true }
    )
    
    const resize = (): void => {
      setTimeout(() => {
        if (powerFactorRef.value) {
          initChart(powerFactorRef.value)
        }
      }, 1500)
    }
    
    onMounted(() => {
      if (powerFactorRef.value) {
        initChart(powerFactorRef.value)
      }
      window.addEventListener('resize', resize)
    })
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', resize)
      if (myChart) {
        myChart.dispose()
        myChart = null
      }
    })
    
    return () => (
      <div class={[styles['pie-box'], props.class]}>
        <div class={[styles['power-factor'], props.pieClass]} ref={powerFactorRef}></div>
        <div class={styles.content}>
          {slots.default?.()}
        </div>
      </div>
    )
  }
})