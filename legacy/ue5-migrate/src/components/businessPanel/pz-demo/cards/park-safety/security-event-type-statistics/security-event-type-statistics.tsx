import { defineComponent } from 'vue'

export const SecurityEventTypeStatistics = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div>
        <h3>安全事件类型统计</h3>
      </div>
    )
  }
})