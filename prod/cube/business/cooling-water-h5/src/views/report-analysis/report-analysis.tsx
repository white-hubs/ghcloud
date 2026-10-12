import { defineComponent, onMounted } from 'vue'
import './report-analysis.less'
import { BaseData } from './components/base-data'
import { ActiveMerchants } from './components/active-merchants'
import { UseData } from './components/use-data'

/** 报表统计 */
export const ReportAnalysis = defineComponent({
  setup: () => {
    onMounted(() => {
    })

    return () => (
      <div class='report-analysis'>
        <BaseData />
        <ActiveMerchants />
        <UseData />
      </div>
    )
  },
})
