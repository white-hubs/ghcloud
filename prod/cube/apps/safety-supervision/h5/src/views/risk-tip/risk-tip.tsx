import { getAssetsFile } from '@/utils'
import { defineComponent } from 'vue'

/** 风险指数 说明 */
export const RiskTip = defineComponent({
  setup () {
    return (): JSX.Element =>
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <img src={getAssetsFile('risk-page.png')} alt='' srcset='' />
      </div>
  }
})
