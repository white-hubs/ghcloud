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
import styles from './running-time-statistics.module.less'
import { PZService } from '../../../card-service/service'
use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const RunningTimeStatistics = defineComponent({
  setup () {
    // 时间范围选择
    const timeRange = ref({
      timeType: 'TODAY',
      dateRange: []
    })

    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)

    // 模拟数据
    const handleChangeTime = async (): Promise<void> => {
      const result = await PZService.device.getDeviceRunTimeStatistics({
        type: timeRange.value.timeType,
        period: timeRange.value.dateRange.join(',')
      })
      const xAxis = result.map(item => item.time)
      const types = []
      result.forEach(item=>{
        item.types.forEach(item=>{
          if (!types.includes(item.type)){
            types.push(item.type)
          }
        })
      })
      const series = types.map(type=>{
        return {
          name: type,
          data: result.map(item=>{
            const itemType = item.types.find(item=>item.type === type)
            return itemType ? itemType.count : 0
          })
        }
      })
      updateChart({
        xAxis,
        series
      })

      // const data = {
      //   TODAY: {
      //     xAxis: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      //     series: [
      //       {
      //         name: '空调设备',
      //         data: [2, 3, 4, 5, 4, 3, 4, 3]
      //       },
      //       {
      //         name: '照明设备',
      //         data: [3, 4, 5, 4, 3, 4, 3, 2]
      //       },
      //       {
      //         name: '监控设备',
      //         data: [4, 4, 4, 4, 4, 4, 4, 4]
      //       }
      //     ]
      //   },
      //   THIS_WEEK: {
      //     xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      //     series: [
      //       {
      //         name: '空调设备',
      //         data: [20, 22, 21, 23, 20, 19, 18]
      //       },
      //       {
      //         name: '照明设备',
      //         data: [18, 19, 20, 21, 19, 18, 17]
      //       },
      //       {
      //         name: '监控设备',
      //         data: [24, 24, 24, 24, 24, 24, 24]
      //       }
      //     ]
      //   },
      //   THIS_MONTH: {
      //     xAxis: ['第1周', '第2周', '第3周', '第4周'],
      //     series: [
      //       {
      //         name: '空调设备',
      //         data: [140, 145, 142, 138]
      //       },
      //       {
      //         name: '照明设备',
      //         data: [130, 135, 132, 128]
      //       },
      //       {
      //         name: '监控设备',
      //         data: [168, 168, 168, 168]
      //       }
      //     ]
      //   },
      //   THIS_YEAR: {
      //     xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      //     series: [
      //       {
      //         name: '空调设备',
      //         data: [600, 580, 620, 650, 700, 720, 680, 660, 640, 620, 590, 580]
      //       },
      //       {
      //         name: '照明设备',
      //         data: [550, 530, 570, 600, 650, 670, 630, 610, 590, 570, 540, 530]
      //       },
      //       {
      //         name: '监控设备',
      //         data: [720, 720, 720, 720, 720, 720, 720, 720, 720, 720, 720, 720]
      //       }
      //     ]
      //   }
      // }
      // return data[timeType]
    }


    // 更新图表
    const updateChart = (chartData: {
      xAxis: string[];
      series: {
        name: string;
        data: number[];
      }[];
    }): void => {
      if (!chartInstance) return

      // const chartData = await handleChangeTime()
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['空调设备', '照明设备', '监控设备'],
          textStyle: {
            color: '#ffffff'
          },
          top: 0
        },
        grid: {
          top: calcFontSize(60),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(0), // 增加底部空间，为滚动条和标签留出更多空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.xAxis,
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
          name: '运行时长(小时)',
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
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: chartData.series.map(item => ({
          name: item.name,
          type: 'bar',
          data: item.data,
          barGap: '30%',
          barWidth: calcFontSize(10), // 固定柱子宽度
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicInOut'
        }))
      }
      chartInstance.setOption(option)
    }


    onMounted(() => {
      chartInstance = echarts.init(chartRef.value)
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate
        title="设备运行时间统计"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={timeRange.value}
              onSearch={handleChangeTime}
            />
          )
        }}
      >
        <div class={styles.container} ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})