import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { chartHostStyle, resolveEchartsInitSize, scheduleEchartsMount } from '@/utils/echarts-chart-host'
import type { EChartsType } from 'echarts'
import * as echarts from 'echarts'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

const CHART_MIN_HEIGHT = 320

/**
 * Batch-4 S66：`CubeLayout` + ECharts 柱状图；`echarts.init` 与 `ResizeObserver` 触发 `resize`，卸载时 `disconnect` + `dispose`；无路由。
 */
export const ShowcaseSceneS66 = defineComponent({
  name: 'ShowcaseSceneS66',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S66 ECharts Bar'
    const chartRef = ref<HTMLDivElement | undefined>(undefined)
    let chart: EChartsType | undefined
    let resizeObserver: ResizeObserver | undefined

    const mountBarChart = (): void => {
      const el = chartRef.value
      if (!el || chart) {
        return
      }
      const { width, height } = resolveEchartsInitSize(el, CHART_MIN_HEIGHT)
      chart = echarts.init(el, undefined, { width, height })
      chart.setOption({
        textStyle: { fontFamily: 'inherit' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [120, 200, 150, 80] }],
      })
      chart.resize()
      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          chart?.resize()
        })
      }
      resizeObserver.observe(el)
    }

    onMounted(() => {
      scheduleEchartsMount(mountBarChart)
    })

    onUnmounted(() => {
      resizeObserver?.disconnect()
      chart?.dispose()
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='柱状图'>
          <div ref={chartRef} style={{ ...chartHostStyle, height: CHART_MIN_HEIGHT, minHeight: CHART_MIN_HEIGHT }} />
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
