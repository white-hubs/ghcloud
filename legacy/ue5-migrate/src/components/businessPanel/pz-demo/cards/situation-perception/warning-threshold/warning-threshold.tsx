import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'

use([
  CanvasRenderer,
  GaugeChart,
  TitleComponent,
  TooltipComponent
])

export const WarningThreshold = defineComponent({
  setup () {
    const chartRefs = ref<HTMLElement[]>([])
    const chartInstances: echarts.ECharts[] = []

    // 模拟预警类型及其阈值和实时值数据
    const warningData = [
      { name: '火灾预警', threshold: 80, value: 65 },
      { name: '入侵预警', threshold: 70, value: 50 },
      { name: '设备故障', threshold: 90, value: 85 },
      { name: '环境异常', threshold: 75, value: 60 }
    ]

    const initCharts = (): void => {
      chartRefs.value.forEach((el, index) => {
        const chartInstance = echarts.init(el as HTMLElement)
        chartInstances.push(chartInstance)
        const data = warningData[index]
        
        // 根据阈值动态设置颜色分段
        const thresholdRatio = data.threshold / 100
        const colorStops = [
          [thresholdRatio * 0.8, '#91cc75'], // 绿色表示安全
          [thresholdRatio, '#fac858'], // 黄色表示接近阈值
          [1, '#ee6666'] // 红色表示超过阈值
        ]
        
        chartInstance.setOption({
          tooltip: {
            formatter: `{a} <br/>{b} : {c}<br/>阈值: ${data.threshold}`,
            textStyle: {
              fontSize: calcFontSize(12),
            }
          },
          series: [
            {
              name: data.name,
              type: 'gauge',
              min: 0,
              max: 100,
              splitNumber: 5,
              radius: '75%',
              startAngle: 225,
              endAngle: -45,
              axisLine: {
                lineStyle: {
                  width: 8,
                  color: colorStops
                }
              },
              axisTick: {
                length: 6,
                lineStyle: {
                  color: '#ffffff',
                  width: 1
                }
              },
              splitLine: {
                length: 8,
                lineStyle: {
                  color: '#ffffff',
                  width: 2
                }
              },
              axisLabel: {
                fontSize: calcFontSize(10),
                color: '#fff',
                distance: 12,
                formatter: (value: number): string => {
                  return value % 20 === 0 ? value.toString() : '';
                }
              },
              pointer: {
                width: 4,
                length: '60%',
                itemStyle: {
                  color: '#c23531'
                }
              },
              data: [{ value: data.value, name: data.name }],
              title: {
                fontSize: calcFontSize(12),
                offsetCenter: [0, '100%'], // 从80%调整到90%，向下移动
                color: '#ffffff'
              },
              detail: {
                fontSize: calcFontSize(14),
                offsetCenter: [0, '50%'], // 从30%调整到50%，向下移动
                color: '#ffffff',
                formatter: (value: number): string => {
                  return `${value}\n阈值: ${data.threshold}`
                }
              }
            },
            // 阈值指示器系列
            {
              type: 'gauge',
              min: 0,
              max: 100,
              radius: '85%',
              startAngle: 225,
              endAngle: -45,
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false
              },
              axisLabel: {
                show: false
              },
              pointer: {
                show: false
              },
              title: {
                show: false
              },
              detail: {
                show: false
              },
              data: [{
                value: data.threshold,
                itemStyle: {
                  color: 'transparent'
                }
              }],
              // 使用anchor来标记阈值位置
              anchor: {
                show: true,
                showAbove: true,
                size: 8,
                itemStyle: {
                  color: '#ff4d4f',
                  borderColor: '#ffffff',
                  borderWidth: 2
                }
              }
            }
          ]
        })
      })
    }

    const chartResize = (): void => {
      chartInstances.forEach(instance => instance.resize())
    }

    onMounted(() => {
      initCharts()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', chartResize)
      chartInstances.forEach(instance => instance.dispose())
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="预警阈值监控">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '10px',
          padding: '10px'
        }}>
          {warningData.map((item, index) => (
            <div
              key={index}
              style={{
                height: '185px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '5px'
              }}
              ref={el => chartRefs.value[index] = el as HTMLElement}
            ></div>
          ))}
        </div>
      </SubPanelTemplate>
    )
  }
})