import { defineComponent } from 'vue'
import './legend.less'

/** 图例 */
export const Legend = defineComponent({
  setup () {
    return (): JSX.Element =>
      <div class='legend'>
        <span class='item normal'>正常</span>
        <span class='item high'>超过上限</span>
        <span class='item low'>低于下限</span>
      </div>
  }
})
