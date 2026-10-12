import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'

export const ParkingChargeStationRankingStatistics = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "充电桩名称",
        dataIndex: "name",
      },
      {
        title: "使用率",
        dataIndex: "usageRate",
      },
      {
        title: "归属区域",
        dataIndex: "area",
      },
    ]);

    // 模拟数据，实际项目中需要替换为API调用
    const data = ref([
      { name: '充电桩A', usageRate: '95.5%', area: 'A区' },
      { name: '充电桩B', usageRate: '92.3%', area: 'B区' },
      { name: '充电桩C', usageRate: '88.7%', area: 'A区' },
      { name: '充电桩D', usageRate: '85.2%', area: 'C区' },
      { name: '充电桩B', usageRate: '92.3%', area: 'B区' },
      { name: '充电桩C', usageRate: '88.7%', area: 'A区' },
      { name: '充电桩D', usageRate: '85.2%', area: 'C区' },
      { name: '充电桩E', usageRate: '82.9%', area: 'B区' }
    ]);

    const getData = async (): Promise<void> =>{
      try {
        const result = await PZService.parking.getChargingStationRankingStatistics()
        data.value = result.map(item => ({
          name: item.name,
          usageRate: `${item.utilization}%`,
          area: item.areaName
        }))
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate title="充电桩使用率TOP5">
        <div class='card-container-2'>
          <RollTable column={columns.value} data={data.value}></RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})