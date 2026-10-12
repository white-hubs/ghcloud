import { defineComponent } from 'vue'
import './entry.less'
import { useJumpApplication } from './applications'

/** 入口页面 */
export const Entry = defineComponent({
  setup: () => {
    useJumpApplication()
    return () =>
      <div class='loader-bg'>
        <div class='loader' />
      </div>
  }
})
