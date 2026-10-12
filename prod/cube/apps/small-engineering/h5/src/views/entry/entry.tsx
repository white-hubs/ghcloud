import { defineComponent } from 'vue'
import styles from './entry.module.less'
import * as echarts from 'echarts/core'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
import { SmallCards } from './cards/security-monitor/small-cards'

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  GridComponent
])

/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    return (): JSX.Element =>
      <>
        <CubeNavBar title='小散工程' showBack />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode={__ENV__.applicationCode} routes={routes} />
          <SmallCards />
        </div>
      </>
  }
})
