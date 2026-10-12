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
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import styles from './risk-coverage-alarm-device-type-statistics.module.less'
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])
export const RiskCoverageAlarmDeviceTypeStatistics = defineComponent({
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'THIS_WEEK',
      dateRange: []
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    let chartData = [
      { type: '空调设备', count: 25, details: [
        { level: '紧急报警', count: 5 },
        { level: '重要报警', count: 8 },
        { level: '一般报警', count: 12 }
      ] },
      { type: '照明设备', count: 18, details: [
        { level: '紧急报警', count: 3 },
        { level: '重要报警', count: 6 },
        { level: '一般报警', count: 9 }
      ] },
      { type: '监控设备', count: 22, details: [
        { level: '紧急报警', count: 4 },
        { level: '重要报警', count: 7 },
        { level: '一般报警', count: 11 }
      ] },
      { type: '电梯设备', count: 15, details: [
        { level: '紧急报警', count: 2 },
        { level: '重要报警', count: 5 },
        { level: '一般报警', count: 8 }
      ] },
      { type: '门禁设备', count: 20, details: [
        { level: '紧急报警', count: 4 },
        { level: '重要报警', count: 6 },
        { level: '一般报警', count: 10 }
      ] }
    ]
    // 获取报警数据
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceAlarmAlarmDeviceTypeStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      chartData = result.map(item=>{

        const total = item.details.reduce((prev, cur)=>{
          return prev + cur.number
        }, 0)
        return {
          type: item.deviceType,
          count: total,
          details: item.details.map(type=>{
            return {
              level: type.name,
              count: type.number
            }
          })
        }
      })
      updateChart()
    }

    // 更新图表
    const updateChart = (): void => {
      if (!chartInstance) return

      // const alarmData = getAlarmData(timeRange.value.timeType)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params): string => {
            const data = chartData[params[0].dataIndex]
            if (data.details) {
              let html = `${data.type}<br/>`
              data.details.forEach(detail => {
                html += `${detail.level}: ${detail.count}次<br/>`
              })
              html += `<br/>总计: ${data.count}次`
              return html
            }
            return `${data.type}<br/>报警次数: ${data.count}次`
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
          data: chartData.map(item => item.type),
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
          name: '报警次数',
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
        series: [
          {
            type: 'bar',
            data: chartData.map(item => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.3)' },
                ])
              }
            })),
            barWidth: '40%',
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        ]
      }
      chartInstance.setOption(option)
    }

    // // 监听时间范围变化
    // watch(() => timeRange.value.timeType, () => {
    //   updateChart()
    // })

    onMounted(() => {
      chartInstance = echarts.init(chartRef.value)
      updateChart()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="设备报警类型统计"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
              onSearch={getData}
            />
          )
        }}
      >
        <div class={styles.container}>
          <div class='card-container-2' ref={chartRef}></div>
        </div>
      </SubPanelTemplate>
    )
  }
})