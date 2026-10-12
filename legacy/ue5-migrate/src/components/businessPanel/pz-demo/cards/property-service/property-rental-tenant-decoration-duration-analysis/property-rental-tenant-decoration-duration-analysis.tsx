import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import 'echarts-liquidfill'
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue"

export const PropertyRentalTenantDecorationDurationAnalysis = defineComponent({
  name: 'PropertyRentalTenantDecorationDurationAnalysis',
  setup () {
    const faultRate = ref<number>(45);
    return (): JSX.Element => (
      <SubPanelTemplate title='物业租赁租户装修时长分析'>
        <div class={['card-container-4']} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <WaterPolo title="" value={faultRate.value} unit="天" bgColor="rgba(59, 130, 246, 0.8)" color="rgba(59, 130, 246, 0.8)"></WaterPolo>
        </div>
      </SubPanelTemplate>
    )
  }
})