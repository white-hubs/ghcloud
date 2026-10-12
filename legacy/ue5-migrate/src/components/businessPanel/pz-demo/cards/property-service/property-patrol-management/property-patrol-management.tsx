import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'


export const PropertyPatrolManagement = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "巡查人员",
        dataIndex: "type",
      },
      {
        title: "时间",
        dataIndex: "time",
      },
      {
        title: "地点",
        dataIndex: "area",
      },
      {
        title: "内容",
        dataIndex: "event",
      },
    ]);
    const data = ref();
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertySecurityPatrolManagement(10, 1);
      data.value = res.records.map(item => ({
        type: item.personName,
        time: item.patrolTime,
        area: item.address,
        event: item.eventType
      }))
    }
    getData()
    return (): JSX.Element => (
      <SubPanelTemplate title="在线预约和咨询服务">
        <div class='card-container-2' >
          <RollTable column={columns.value} data={data.value} showLength={8}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})