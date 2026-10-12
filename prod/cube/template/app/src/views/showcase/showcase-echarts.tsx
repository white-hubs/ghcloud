import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { chartHostStyle, resolveEchartsInitSize, scheduleEchartsMount } from '@/utils/echarts-chart-host'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export const ShowcaseEcharts = defineComponent({
  name: 'ShowcaseEcharts',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const lineRef = ref<HTMLDivElement | undefined>(undefined)
    const barRef = ref<HTMLDivElement | undefined>(undefined)
    const pieRef = ref<HTMLDivElement | undefined>(undefined)
    let chartLine: EChartsType | undefined
    let chartBar: EChartsType | undefined
    let chartPie: EChartsType | undefined
    let ro: ResizeObserver | undefined

    const mountCharts = (): void => {
      const common = { textStyle: { fontFamily: 'inherit' } }
      if (lineRef.value && !chartLine) {
        const { width, height } = resolveEchartsInitSize(lineRef.value, 320)
        chartLine = echarts.init(lineRef.value, undefined, { width, height })
        chartLine.setOption({
          ...common,
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          yAxis: { type: 'value' },
          series: [{ type: 'line', smooth: true, data: [12, 19, 8, 22, 15] }],
        })
        chartLine.resize()
      }
      if (barRef.value && !chartBar) {
        const { width, height } = resolveEchartsInitSize(barRef.value, 280)
        chartBar = echarts.init(barRef.value, undefined, { width, height })
        chartBar.setOption({
          ...common,
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['A', 'B', 'C'] },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: [40, 32, 28] }],
        })
        chartBar.resize()
      }
      if (pieRef.value && !chartPie) {
        const { width, height } = resolveEchartsInitSize(pieRef.value, 300)
        chartPie = echarts.init(pieRef.value, undefined, { width, height })
        chartPie.setOption({
          ...common,
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
      }
      if (chartLine || chartBar || chartPie) {
        if (!ro) {
          ro = new ResizeObserver(() => {
            chartLine?.resize()
            chartBar?.resize()
            chartPie?.resize()
          })
        }
        if (lineRef.value) {
          ro.observe(lineRef.value)
        }
        if (barRef.value) {
          ro.observe(barRef.value)
        }
        if (pieRef.value) {
          ro.observe(pieRef.value)
        }
      }
    }

    onMounted(() => {
      scheduleEchartsMount(mountCharts)
    })

    onUnmounted(() => {
      ro?.disconnect()
      chartLine?.dispose()
      chartBar?.dispose()
      chartPie?.dispose()
    })

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <div>
          <Card title={t('showcase.echarts.line')} style={{ marginBottom: 16 }}>
            <div ref={lineRef} style={{ ...chartHostStyle, height: 320, minHeight: 320 }} />
          </Card>
          <Card title={t('showcase.echarts.bar')} style={{ marginBottom: 16 }}>
            <div ref={barRef} style={{ ...chartHostStyle, height: 280, minHeight: 280 }} />
          </Card>
          <Card title={t('showcase.echarts.pie')}>
            <div ref={pieRef} style={{ ...chartHostStyle, height: 300, minHeight: 300 }} />
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · ECharts'} v-slots={slots} showFooter={false} />
  },
})
