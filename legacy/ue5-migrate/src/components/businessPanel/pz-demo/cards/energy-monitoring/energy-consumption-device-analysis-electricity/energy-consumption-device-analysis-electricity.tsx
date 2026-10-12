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

export const EnergyConsumptionDeviceAnalysisElectricity = defineComponent({
  setup () {
    const chartInstances = ref<echarts.ECharts[]>([])
    const chartRefs = ref<(HTMLElement | null)[]>([])

    // 示例设备数据（请替换为真实数据）
    const devices = ref([
      {
        name: '电力设备A',
        lowerLimit: 20,
        upperLimit: 80,
        currentValue: 45,
        unit: 'kW' // 添加单位字段
      },
      {
        name: '电力设备B',
        lowerLimit: 30,
        upperLimit: 70,
        currentValue: 65,
        unit: 'A' // 添加单位字段
      },
      {
        name: '电力设备C',
        lowerLimit: 10,
        upperLimit: 90,
        currentValue: 55,
        unit: 'V' // 添加单位字段
      }
    ])
    const getData = async (): Promise<void>=>{
      try {
        const res = await PZService.energy.getDeviceReading('ELECTRIC')
        res.length > 0 && (devices.value.length = 0)
        res.forEach((item) => {
          devices.value.push({
            name: item.deviceName,
            lowerLimit: item.minValue,
            upperLimit: item.maxValue,
            currentValue: item.currentValue,
            unit: 'kW'
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
            max: 1000,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                width: 10,
                // 换个颜色
                color: [
                  [device.lowerLimit / 1000, '#FFA500'],
                  [device.upperLimit / 1000, '#228B22'],
                  [1, '#FFA500']
                ]
              }
            },
            axisLabel: {
              fontSize: calcFontSize(12),
              color: '#fff',
              distance: 15, // 增加标签与轴线的距离
              formatter: (value): number | string => {
                // 只显示部分刻度，减少重叠
                return value % 40 === 0 ? Math.ceil(Number(value) / 10) : '';
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
            // 增强指针配置
            pointer: {
              show: true,
              itemStyle: {
                color: '#fff', // 改为深灰色
              },
              length: '50%', // 缩短指针长度
              width: 6 // 减小指针宽度
            },
            // 优化数值显示
            detail: {
              show: true,
              fontSize: calcFontSize(24),
              formatter: `{value} ${device.unit}`, // 使用设备单位
              color: '#fff'
            },
            // 设备名称显示
            title: {
              show: true,
              offsetCenter: [0, '80%'],
              textStyle: {
                color: '#fff',
                fontSize: calcFontSize(14)
              }
            },
            // 数据配置
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
              key={index}
              // @ts-ignore
              ref={el => chartRefs.value[index] = el}
              style={{
                flexShrink: 0,
                width: '100%', // 增大宽度
                height: '100%' // 增大高度
              }}
            />
          ))}
        </div>
      </SubPanelTemplate>
    )
  }
})