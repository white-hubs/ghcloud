import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { PZService } from '../../../card-service/service'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])
// todo:接口缺少字段
export const RiskCoverageAlarmDeviceTypeAnalysis = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] // 颜色数组
    // 报警类型数据
    let alarmData = [
      {
        name: '温控报警',
        value: 35,
        devices: ['空调主机', '新风系统', '冷却塔'],
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: '电力报警',
        value: 28,
        devices: ['配电柜', '变压器', 'UPS'],
        itemStyle: { color: '#10B981' }
      },
      {
        name: '安防报警',
        value: 25,
        devices: ['监控摄像头', '门禁系统', '周界报警器'],
        itemStyle: { color: '#F59E0B' }
      },
      {
        name: '消防报警',
        value: 22,
        devices: ['烟感探测器', '温感探测器', '消防栓'],
        itemStyle: { color: '#EF4444' }
      },
      {
        name: '设备故障',
        value: 20,
        devices: ['电梯', '水泵', '照明'],
        itemStyle: { color: '#8B5CF6' }
      }
    ]
    const total = ref(0)
    // 计算总数
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceAlarmAlarmDeviceTypeAnalysis({
        type: '',
        period: ''
      })
      alarmData = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.number,
          devices: item.deviceNames ? item.deviceNames.split(',') : [],
          itemStyle: { color: colors[index] }
        }
      })
      total.value = alarmData.reduce((sum, item) => sum + item.value, 0)
      initChart()
    }
    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return
      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            const data = params.data
            const percentage = ((params.value / total.value) * 100).toFixed(1)
            let html = `${params.name}<br/>设备数量：${params.value}台<br/>占比：${percentage}%<br/><br/>涉及设备：<br/>`
            data.devices.forEach(device => {
              html += `· ${device}<br/>`
            })
            return html
          }
        },
        legend: {
          orient: 'horizontal', // 水平排列
          top: '0%', // 放在顶部
          left: 'center', // 居中显示
          padding: [8, 16], // 可选：调整内边距
          itemGap: 10, // 图例间隔
          textStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          formatter: (name): string => {
            const item = alarmData.find(d => d.name === name)
            const percentage = ((item.value / total.value) * 100).toFixed(1)
            return `${name} ${percentage}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: '45%',
            center: ['50%', '58%'],
            data: alarmData,
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: (params): string => {
                return `${params.name}\n${params.value}台`
              },
              color: '#ffffff',
              fontSize: calcFontSize(12),
              padding: [8, 4], // 添加内边距
              lineHeight: 20 // 增加行高
            },
            labelLine: {
              show: true,
              length: 15, // 增加第一段线长
              length2: 10, // 增加第二段线长
              smooth: true // 添加平滑效果
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title={`报警设备类型分析 (总数：${total.value}台)`}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})