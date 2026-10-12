import { CubeLayout } from '@ghcloud/cube-app-design'
import * as CubeUi from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, type Component } from 'vue'

const STATIC_CALENDAR_DAY = dayjs('2026-01-15')

/** Vue 3 defineComponent 返回对象而非函数，不能只判断 typeof === 'function' */
function isLikelyVueComponent (value: unknown): boolean {
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value === 'function') {
    return true
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    return 'setup' in o || 'render' in o || '__vccOpts' in o || '__name' in o
  }
  return false
}

const calendarExport = (CubeUi as { Calendar?: unknown }).Calendar
const CalendarResolved: Component | undefined =
  isLikelyVueComponent(calendarExport) ? (calendarExport as Component) : undefined

/**
 * Batch-4 S61：`CubeLayout` + cube-ui 的静态 `Calendar`（主入口命名导出；若未解析到则 Alert）；无路由。
 */
export const ShowcaseSceneS61 = defineComponent({
  name: 'ShowcaseSceneS61',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S61 Calendar'

    const slots = {
      'layout-content': (): JSX.Element => {
        if (!CalendarResolved) {
          return (
            <CubeUi.Alert
              message='未从 cube-ui 包中解析到 Calendar 组件'
              description='请确认主入口 main.ts 的聚合 export 中包含 Calendar，且与 import * 的解析方式一致。'
              type='warning'
              showIcon
            />
          )
        }

        return (
          <CubeUi.Card title='Calendar 静态演示'>
            <CalendarResolved value={STATIC_CALENDAR_DAY} />
          </CubeUi.Card>
        )
      },
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
