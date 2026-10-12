import { defineComponent } from 'vue'

export const SecurityEventLevelStatistics = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div>
        <h3>安全事件级别统计</h3>
      </div>
    )
  }
})