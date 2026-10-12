import { defineComponent, onMounted } from 'vue'
import './device-info.less'
import { BaseData } from './components/base-data'
/** 报表统计 */
export const DeviceInfo = defineComponent({
  setup: () => {
    onMounted(() => {
    })

    return () => (
      <div class='report-analysis'>
        <BaseData />

      </div>
    )
  },
})
