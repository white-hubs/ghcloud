import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

export const DeviceAbnormalStatistics = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "设备名称",
        dataIndex: "name",
      },
      {
        title: "故障发生时间",
        dataIndex: "time",
      },
    ]);
    const data = ref([]);
    PZService.laboratory.getDeviceAbnormalStatistics().then(res => {
      data.value = res.map(item => ({
        name: item.deviceName,
        time: dayjs(item.eventDate).format('YYYY-MM-DD HH:mm:ss')
      }))
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