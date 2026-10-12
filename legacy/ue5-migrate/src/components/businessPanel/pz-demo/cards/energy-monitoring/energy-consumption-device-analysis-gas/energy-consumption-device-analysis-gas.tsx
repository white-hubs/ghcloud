import { defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnergyConsumptionDeviceAnalysisGas = defineComponent({
  setup () {
    const chartInstances = ref<echarts.ECharts[]>([])
    const chartRefs = ref<(HTMLElement | null)[]>([])

    // 请替换为真实的气体能耗设备数据
    const devices = ref([
      {
        name: '燃气设备A',
        lowerLimit: 15,
        upperLimit: 75,
        currentValue: 35,
        unit: 'm³'
      },
      {
        name: '燃气设备B',
        lowerLimit: 25,
        upperLimit: 85,
        currentValue: 55,
        unit: 'm³'
      },
      // 可根据需要添加更多设备
    ])
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.energy.getDeviceReading('GAS')
        res.length > 0 && (devices.value.length = 0)
        res.forEach((item) => {
          devices.value.push({
            name: item.deviceName,
            lowerLimit: item.minValue,
            upperLimit: item.maxValue,
            currentValue: item.currentValue,
            unit: 'm³'
          })
        })
      } catch {

      }
      nextTick(()=>{
        initCharts()
      })
    }

    const initCharts = (): void => {
      chartInstances.value = devices.value.map((device, index) => {
        const el = chartRefs.value[index]
        if (!el) return null

        const chart = echarts.init(el as HTMLElement)
        chart.setOption({
          tooltip: {
            show: true,
            formatter: () => `设备: ${device.name}<br/>当前值: ${device.currentValue} ${device.unit}<br/>下限: ${device.lowerLimit} ${device.unit}<br/>上限: ${device.upperLimit} ${device.unit}`,
            textStyle: {
              fontSize: calcFontSize(14),
            }
          },
          series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                width: 10,
                // 更换颜色
                color: [
                  [device.lowerLimit / 100, '#FFA500'],
                  [device.upperLimit / 100, '#32CD32'],
                  [1, '#FF4500']
                ]
              }
            },
            axisLabel: {
              fontSize: calcFontSize(12),
              color: '#fff',
              distance: 15, // 增加标签与轴线的距离
              formatter: (value): number | string => {
                // 只显示部分刻度，减少重叠
                return value % 20 === 0 ? value : '';
              }
            },
            splitLine: {
              lineStyle: {
                color: '#fff'
              }
            },
            axisTick: {
              lineStyle: {
                color: '#fff'
              }
            },
            pointer: {
              show: true,
              itemStyle: {
                color: '#fff',
              },
              length: '50%',
              width: 6
            },
            detail: {
              show: true,
              fontSize: calcFontSize(24),
              formatter: `{value} ${device.unit}`,
              color: '#fff'
            },
            title: {
              show: true,
              offsetCenter: [0, '80%'],
              textStyle: {
                color: '#fff',
                fontSize: calcFontSize(14)
              }
            },
            data: [{
              value: device.currentValue,
              name: device.name
            }]
          }]
        })
        return chart
      }).filter(Boolean) as echarts.ECharts[]
    }

    const chartResize = (): void => {
      chartInstances.value.forEach(chart => chart?.dispose())
      setTimeout(initCharts, 100)
    }

    onMounted(() => {
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstances.value.forEach(chart => chart?.dispose())
      window.removeEventListener('resize', chartResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3'
          style={{
            display: 'flex',
            overflowX: 'auto',
          }}>
          {devices.value.map((item, index) => (
            <div
              key={item.name}
              // @ts-ignore
              ref={el => chartRefs.value[index] = el}
              style={{
                flexShrink: 0,
                width: '100%',
                height: '100%'
              }}
            />
          ))}
        </div>
      </SubPanelTemplate>
    )
  }
})