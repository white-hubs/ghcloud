import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { chartHostStyle, resolveEchartsInitSize, scheduleEchartsMount } from '@/utils/echarts-chart-host'
import type { EChartsType } from 'echarts'
import * as echarts from 'echarts'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

const CHART_MIN_HEIGHT = 320

/**
 * Batch-4 S65：`showcase-echarts.tsx` 折线图片段最小抽取；单容器 ref、`echarts.init` 折线、
 * `ResizeObserver` 联动 `resize`，卸载时 `disconnect` + `dispose`；无路由。
 */
export const ShowcaseSceneS65 = defineComponent({
  name: 'ShowcaseSceneS65',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S65 ECharts Line'
    const lineRef = ref<HTMLDivElement | undefined>(undefined)
    let chartLine: EChartsType | undefined
    let ro: ResizeObserver | undefined

    const mountLineChart = (): void => {
      const el = lineRef.value
      if (!el || chartLine) {
        return
      }
      const { width, height } = resolveEchartsInitSize(el, CHART_MIN_HEIGHT)
      chartLine = echarts.init(el, undefined, { width, height })
      chartLine.setOption({
        textStyle: { fontFamily: 'inherit' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [{ type: 'line', smooth: true, data: [12, 19, 8, 22, 15] }],
      })
      chartLine.resize()
      if (!ro) {
        ro = new ResizeObserver(() => {
          chartLine?.resize()
        })
      }
      ro.observe(el)
    }

    onMounted(() => {
      scheduleEchartsMount(mountLineChart)
    })

    onUnmounted(() => {
      ro?.disconnect()
      chartLine?.dispose()
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='折线图'>
          <div ref={lineRef} style={{ ...chartHostStyle, height: CHART_MIN_HEIGHT, minHeight: CHART_MIN_HEIGHT }} />
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
