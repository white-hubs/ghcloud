import { defineComponent } from 'vue'
import './footer.less'

export const EntranceScreenFooter = defineComponent({
  setup () {
    return (): JSX.Element =>
      <div class='entrance-screen-footer'>
        <div class='legend'>
          <div class='item' style='margin-left:0'>
            <span class='dot' />
            <span class='text'>正常</span>
          </div>
          <div class='item'>
            <span class='dot dot-low' />
            <span class='text'>低于下限</span>
          </div>
          <div class='item'>
            <span class='dot dot-high' />
            <span class='text'>超过上限</span>
          </div>
        </div>
        <span class='copyright'>{window.config.copyright}</span>
      </div>
  }
})
