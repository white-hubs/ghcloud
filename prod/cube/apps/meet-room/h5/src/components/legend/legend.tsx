import { defineComponent } from 'vue'
import './legend.less'

/** 图例 */
export const Legend = defineComponent({
  setup () {
    return (): JSX.Element =>
      <div class='legend'>
        <span class='item noReservable'>不可用</span>
        <span class='item reservable'>空闲中</span>
        <span class='item used'>使用中</span>
        <span class='item reserved'>已预约</span>
        <span class='item approval'>预约中</span>
      </div>
  }
})
