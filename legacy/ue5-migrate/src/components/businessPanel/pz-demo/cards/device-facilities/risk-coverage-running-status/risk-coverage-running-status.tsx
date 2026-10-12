import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './risk-coverage-running-status.module.less'
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])
// todo: 接口缺少数据
export const RiskCoverageRunningStatus = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 设备运行状态数据
    const deviceData = {
      types: ['空调设备', '照明设备', '监控设备', '电梯设备', '门禁设备'],
      status: [
        { name: '正常运行', color: '#10B981' },
        { name: '故障停运', color: '#EF4444' },
        { name: '维修中', color: '#F59E0B' }
      ],
      data: [
        [42, 8, 5], // 空调设备
        [35, 5, 3], // 照明设备
        [28, 4, 2], // 监控设备
        [18, 3, 2], // 电梯设备
        [25, 4, 3] // 门禁设备
      ]
    }
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceAlarmRunStatus({
        type: '',
        period: ''
      })
      const statusColors = ['#10B981', '#EF4444', '#F59E0B']
      deviceData.types = result.map(item=>item.name)
      deviceData.status = result.find(item=>item.name === deviceData.types[0]).status.map((item, index)=>{
        return {
          name: item.type,
          color: statusColors[index]
        }
      })
      deviceData.data = result.map(item=>{
        return item.status.map(status=>status.number)
      })
      initChart()
    }
    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: calcFontSize(40),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(10), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: deviceData.types,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '设备数量(台)',
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: deviceData.status.map((status, index) => ({
          name: status.name,
          type: 'bar',
          stack: '设备',
          itemStyle: {
            color: status.color
          },
          label: {
            show: true,
            position: 'inside',
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          data: deviceData.data.map(item => item[index])
        }))
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
      <SubPanelTemplate title="设备运行状态分布">
        <div class={styles.container}>
          <div class='card-container-3' ref={chartRef}></div>
        </div>
      </SubPanelTemplate>
    )
  }
})