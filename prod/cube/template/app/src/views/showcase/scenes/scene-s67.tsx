import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { chartHostStyle, resolveEchartsInitSize, scheduleEchartsMount } from '@/utils/echarts-chart-host'
import type { EChartsType } from 'echarts'
import * as echarts from 'echarts'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

const CHART_MIN_HEIGHT = 300

/**
 * Batch-4 S67：ECharts 饼图 + `ResizeObserver` 自适应；无路由。
 */
export const ShowcaseSceneS67 = defineComponent({
  name: 'ShowcaseSceneS67',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S67 ECharts 饼图'
    const pieRef = ref<HTMLDivElement | undefined>(undefined)
    let chartPie: EChartsType | undefined
    let ro: ResizeObserver | undefined

    const mountPieChart = (): void => {
      const el = pieRef.value
      if (!el || chartPie) {
        return
      }
      const { width, height } = resolveEchartsInitSize(el, CHART_MIN_HEIGHT)
      chartPie = echarts.init(el, undefined, { width, height })
      chartPie.setOption({
        textStyle: { fontFamily: 'inherit' },
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: '65%',
            data: [
              { value: 335, name: '类型 A' },
              { value: 234, name: '类型 B' },
              { value: 154, name: '类型 C' },
            ],
          },
        ],
      })
      chartPie.resize()
      if (!ro) {
        ro = new ResizeObserver(() => {
          chartPie?.resize()
        })
      }
      ro.observe(el)
    }

    onMounted(() => {
      scheduleEchartsMount(mountPieChart)
    })

    onUnmounted(() => {
      ro?.disconnect()
      chartPie?.dispose()
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='饼图'>
          <div ref={pieRef} style={{ ...chartHostStyle, height: CHART_MIN_HEIGHT, minHeight: CHART_MIN_HEIGHT }} />
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
