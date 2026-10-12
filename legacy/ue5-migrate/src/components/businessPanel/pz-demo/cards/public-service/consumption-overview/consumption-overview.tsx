import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { PZService } from '../../../card-service/service'

export const ConsumptionOverview = defineComponent({
  name: 'ConsumptionOverview',
  setup () {
    // 示例数据，请替换为实际数据
    const paymentCount = ref(0)
    const totalIncome = ref(0)
    PZService.public.getPublicConsumptionAnalysisChargeOverview().then(res => {
      paymentCount.value = res.payments
      totalIncome.value = res.count
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-4' style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.15rem', marginBottom: '0.1em' }}>支付笔数</div>
            <div style={{ fontSize: '0.15rem', fontWeight: 'bold' }}>{paymentCount.value}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.15rem', marginBottom: '0.1em' }}>收入总和</div>
            <div style={{ fontSize: '0.15rem', fontWeight: 'bold' }}>¥{totalIncome.value.toLocaleString()}</div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})