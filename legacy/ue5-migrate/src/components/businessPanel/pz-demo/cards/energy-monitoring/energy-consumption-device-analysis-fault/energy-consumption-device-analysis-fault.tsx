import { defineComponent, ref, watch } from 'vue'
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PZService } from '../../../card-service/service'

export const EnergyConsumptionDeviceAnalysisFault = defineComponent({
  setup () {
    const faultRate = ref<number>(0);
    const countType = ref({
      timeType: "WATER", // 水
    })
    const getData = async (): Promise<void> => {
      // @ts-ignore
      const res = await PZService.energy.getDeviceFaultStatistics(countType.value.timeType);
      faultRate.value = res.faultRate * 100;
    }
    // 监听 countType 变化
    watch(() => countType.value.timeType, getData, { immediate: true });

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={countType.value} timeList={[
            { label: "水", value: "WATER" },
            { label: "电", value: "ELECTRIC" },
            { label: "气", value: "GAS" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <WaterPolo title="" value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></WaterPolo>
        </div>
      </SubPanelTemplate>
    )
  }
})