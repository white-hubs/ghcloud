import { defineComponent, ref } from 'vue'
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { PZService } from '../../../card-service/service'

export const EnergyConsumptionAlarmOverview = defineComponent({
  setup () {
    const faultRate = ref<number>(1);
    const dataList = ref([
      {
        title: "报警总数量",
        value: 1,
        ringRatio: false,
        label: 90,
        unit: "",
      },
    ]);
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getAlarmOverview();
      faultRate.value = res.totalCount;
      dataList.value[0].value = res.totalCount;
    }
    getData()


    return (): JSX.Element => (
      <SubPanelTemplate >
        <div class='card-container-3' style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <WaterPolo title="" value={faultRate.value} unit="" bgColor="#FFC700" color="#FFC700"></WaterPolo>
          <DeviceModule dataList={dataList.value}></DeviceModule>
        </div>
      </SubPanelTemplate>
    )
  }
})