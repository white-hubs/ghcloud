import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { PZService } from '../../../card-service/service'

export const ParkingFeeOverview = defineComponent({
  setup () {
    const currentReservationCount = ref<number>(5000);
    const dataList = ref([
      {
        title: "今日停车总收入",
        value: currentReservationCount.value,
        ringRatio: false,
        label: currentReservationCount.value,
        unit: "",
      },
    ]);
    const getData = async (): Promise<void> => {
      try {
        const result = await PZService.parking.getParkingFeeOverview()
        currentReservationCount.value = result
        dataList.value[0].value = result
        dataList.value[0].label = result
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <WaterPolo title="" value={currentReservationCount.value} unit="" bgColor="#FFC700" color="#FFC700"></WaterPolo>
          <DeviceModule dataList={dataList.value}></DeviceModule>
        </div>
      </SubPanelTemplate>
    )
  }
})