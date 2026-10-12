import { computed, defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { PZService } from '../../../card-service/service'

export const ReservationStatistics = defineComponent({
  setup () {
    // 修改为实验室当前预定数量
    const currentReservationCount = ref<number>(0);
    const dataList = computed(()=>{
      return [
        {
          title: "当前预定数量",
          value: currentReservationCount.value,
          ringRatio: false,
          label: currentReservationCount.value,
          unit: "",
        },
      ]
    })
    PZService.laboratory.getBookingStatistics().then(res=>{
      currentReservationCount.value = res.reservationCount
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