import { defineComponent } from 'vue'

export const SecurityEventHandlingStatus = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div>
        <h3>安全事件处理状态</h3>
      </div>
    )
  }
})