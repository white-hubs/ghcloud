import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import styles from './enterprise-scale-analysis.module.less'

use([
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export const EnterpriseScaleAnalysis = defineComponent({
  name: 'EnterpriseScaleAnalysis',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)
    const timeRange = ref({
      timeType: 'EMPLOYEE',
      dateRange: []
    })

    // 企业数据 - 基于提供的表格数据
    const enterpriseData = [
      { name: '蓝海科技', industry: '人工智能', employees: 85, revenue: 12000, desc: '高研发投入的科技独角兽' },
      { name: '晨光食品', industry: '食品加工', employees: 220, revenue: 8500, desc: '区域性龙头食品厂' },
      { name: '微创医疗', industry: '医疗器械', employees: 35, revenue: 1200, desc: '初创期医疗技术公司' },
      { name: '绿源农业', industry: '农业', employees: 8, revenue: 300, desc: '家庭农场转型企业' },
      { name: '星辰教育', industry: '教育', employees: 150, revenue: 2800, desc: '连锁职业教育机构' },
      { name: '快运物流', industry: '物流', employees: 450, revenue: 15000, desc: '全国性物流集团' },
      { name: '云端设计', industry: '建筑设计', employees: 12, revenue: 800, desc: '小型设计工作室' },
      { name: '智联零售', industry: '零售', employees: 600, revenue: 32000, desc: '电商平台头部企业' },
      { name: '优享出行', industry: '交通出行', employees: 1800, revenue: 85000, desc: '共享出行行业巨头' },
      { name: '悦居地产', industry: '房地产', employees: 50, revenue: 1500, desc: '区域性房产中介公司' }
    ]

    // 按员工数分级
    const getEmployeeScaleData = (): unknown[] => {
      const scaleRanges = [
        { range: '10人以下', min: 0, max: 10 },
        { range: '10-50人', min: 10, max: 50 },
        { range: '50-200人', min: 50, max: 200 },
        { range: '200-500人', min: 200, max: 500 },
        { range: '500-1000人', min: 500, max: 1000 },
        { range: '1000人以上', min: 1000, max: Infinity }
      ]

      return scaleRanges.map(scale => {
        const count = enterpriseData.filter(item =>
          item.employees >= scale.min && item.employees < scale.max).length
        return {
          range: scale.range,
          count: count,
          enterprises: enterpriseData.filter(item =>
            item.employees >= scale.min && item.employees < scale.max)
        }
      })
    }

    // 按营收分级
    const getRevenueScaleData = (): unknown[] => {
      const scaleRanges = [
        { range: '500万以下', min: 0, max: 500 },
        { range: '500-1000万', min: 500, max: 1000 },
        { range: '1000-5000万', min: 1000, max: 5000 },
        { range: '5000万-1亿', min: 5000, max: 10000 },
        { range: '1亿-5亿', min: 10000, max: 50000 },
        { range: '5亿以上', min: 50000, max: Infinity }
      ]

      return scaleRanges.map(scale => {
        const count = enterpriseData.filter(item =>
          item.revenue >= scale.min && item.revenue < scale.max).length
        return {
          range: scale.range,
          count: count,
          enterprises: enterpriseData.filter(item =>
            item.revenue >= scale.min && item.revenue < scale.max)
        }
      })
    }

    const updateChart = (): void => {
      if (!chartInstance) {
        // (function(){})('图表实例未初始化')
        return
      }

      const scaleData = timeRange.value.timeType === 'EMPLOYEE'
        ? getEmployeeScaleData()
        : getRevenueScaleData()


      const xData = scaleData.map(item => (item as { range: number; }).range)
      const yData = scaleData.map(item => (item as { count: number; }).count)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params): string {
            const data = scaleData[params[0].dataIndex]
            let result = `${(data as { range: number; }).range}<br/>企业数量：${(data as { count: number; }).count}家<br/>`

            if ((data as { enterprises: { name: string; industry: unknown; }[]; }).enterprises.length > 0) {
              result += '<br/>代表企业：<br/>';
              (data as { enterprises: { name: string; industry: unknown; }[]; }).enterprises.forEach(enterprise => {
                result += `${enterprise.name}（${enterprise.industry}）<br/>`
              })
            }

            return result
          }
        },
        grid: {
          top: calcFontSize(10),
          left: calcFontSize(10),
          right: calcFontSize(10),
          bottom: calcFontSize(10),
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            bottom: calcFontSize(5),
            height: calcFontSize(15),
            start: 0,
            end: timeRange.value.timeType === 'THIS_MONTH' ? 40 : // 本月默认显示40%
              timeRange.value.timeType === 'THIS_YEAR' ? 100 : // 本年显示全部
                timeRange.value.timeType === 'TODAY' ? 50 : 100,
            zoomLock: false, // 允许缩放
            brushSelect: false, // 禁用刷选
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '110%',
            handleStyle: {
              color: '#3b82f6',
              borderColor: '#3b82f6',
              borderWidth: 1
            },
            moveHandleStyle: {
              color: '#3b82f6'
            },
            fillerColor: 'rgba(59, 130, 246, 0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: 'transparent',
            textStyle: {
              color: '#ffffff',
              fontSize: calcFontSize(10)
            },
            emphasis: {
              handleStyle: {
                color: '#60a5fa',
                borderColor: '#60a5fa'
              }
            }
          },
          {
            type: 'inside', // 添加内置缩放，支持鼠标滚轮
            xAxisIndex: [0],
            start: 0,
            end: 50,
            zoomOnMouseWheel: 'shift', // 按住shift时才能缩放，避免误触
            moveOnMouseMove: true // 支持拖动
          }
        ],
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12),
            interval: 0,
            rotate: 30
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '企业数量',
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
          }
        },
        series: [
          {
            name: '企业数量',
            type: 'bar',
            data: yData,
            barWidth: '40%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.3)' }
              ])
            },
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: calcFontSize(12)
            }
          }
        ]
      }

      chartInstance?.setOption(option)
    }

    const initChart = (): void => {
      if (!chartRef.value) return
      chartInstance = echarts.init(chartRef.value)
      updateChart()
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
      window.removeEventListener('resize', handleResize)
    })

    watch(() => timeRange.value.timeType, updateChart)

    return (): JSX.Element => (
      <SubPanelTemplate title='企业规模分析' v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={timeRange.value}></DateInlineForm>
        )
      }}>
        <div class='card-container-4'>
          <div class={styles.container}>
            <div class={styles.summary}>
              <div class={styles.summaryItem}>
                <div class={styles.summaryValue}>{enterpriseData.length}</div>
                <div class={styles.summaryLabel}>企业总数</div>
              </div>
              <div class={styles.summaryItem}>
                <div class={styles.summaryValue}>
                  {timeRange.value.timeType === 'EMPLOYEE'
                    ? Math.round(enterpriseData.reduce((sum, item) => sum + item.employees, 0) / enterpriseData.length)
                    : Math.round(enterpriseData.reduce((sum, item) => sum + item.revenue, 0) / enterpriseData.length / 100) / 10 + '亿'}
                </div>
                <div class={styles.summaryLabel}>
                  {timeRange.value.timeType === 'EMPLOYEE' ? '平均员工数' : '平均营收'}
                </div>
              </div>
              <div class={styles.summaryItem}>
                <div class={styles.summaryValue}>
                  {timeRange.value.timeType === 'EMPLOYEE'
                    ? enterpriseData.reduce((max, item) => Math.max(max, item.employees), 0)
                    : (enterpriseData.reduce((max, item) => Math.max(max, item.revenue), 0) / 10000).toFixed(1) + '亿'}
                </div>
                <div class={styles.summaryLabel}>最大规模</div>
              </div>
            </div>
            <div ref={chartRef} class={styles.chartContainer}></div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})