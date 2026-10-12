import { defineComponent } from 'vue'

export const SecurityEventTimeAnalysis = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div>
        <h3>安全事件时间分析</h3>
      </div>
    )
  }
})