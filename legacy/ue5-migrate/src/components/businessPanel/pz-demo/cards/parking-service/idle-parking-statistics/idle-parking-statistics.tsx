import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'

export const IdleParkingStatistics = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "区域",
        dataIndex: "name",
      },
      {
        title: "空闲车位",
        dataIndex: "availableSpaces",
      },
      {
        title: "滞留车位",
        dataIndex: "remainingParkCount",
      },
      {
        title: "总车位",
        dataIndex: "totalSpaces",
      },
    ]);
    const data = ref([
      { name: 'A区', totalSpaces: 100, availableSpaces: 30, remainingParkCount: 10 },
      { name: 'B区', totalSpaces: 150, availableSpaces: 45, remainingParkCount: 15 },
      { name: 'C区', totalSpaces: 80, availableSpaces: 25, remainingParkCount: 20 },
      { name: 'D区', totalSpaces: 120, availableSpaces: 35, remainingParkCount: 30 },
      { name: 'B区', totalSpaces: 150, availableSpaces: 45, remainingParkCount: 10 },
      { name: 'C区', totalSpaces: 80, availableSpaces: 25, remainingParkCount: 15 },
      { name: 'D区', totalSpaces: 120, availableSpaces: 35, remainingParkCount: 25 },
      { name: 'E区', totalSpaces: 90, availableSpaces: 20, remainingParkCount: 10 }
    ]);
    const getData = async (): Promise<void> => {
      try {
        const result = await PZService.parking.getFreeParkingStatistics()
        data.value = result?.map(item => ({
          name: item.areaName,
          totalSpaces: item.totalParkCount,
          availableSpaces: item.freeParkCount,
          remainingParkCount: item.remainingParkCount,
        }))
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-4' >
          <RollTable column={columns.value} data={data.value}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})