import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'

export const OnlineReservationOverview = defineComponent({
  name: 'OnlineReservationOverview',
  setup () {
    const columns = ref([
      {
        title: "类型",
        dataIndex: "type",
      },
      {
        title: "名称",
        dataIndex: "name",
      },
      {
        title: "时间",
        dataIndex: "time",
      },
    ]);
    const data = ref([
      {
        type: '预约',
        name: 'A企业',
        time: '2024-07-01'
      },
      {
        type: '预约',
        name: 'B企业',
        time: '2024-07-01'
      },
      {
        type: '预约',
        name: 'B企业',
        time: '2024-07-01'
      },
      {
        type: '预约',
        name: 'B企业',
        time: '2024-07-01'
      },
      {
        type: '预约',
        name: 'C企业',
        time: '2024-07-01'
      },
      {
        type: '咨询',
        name: 'A企业',
        time: '2024-07-01'
      },
      {
        type: '咨询',
        name: 'A企业',
        time: '2024-07-01'
      },
      {
        type: '咨询',
        name: 'A企业',
        time: '2024-07-01'
      },
      {
        type: '咨询',
        name: 'A企业',
        time: '2024-07-01'
      },
    ]);
    const getData = async (): Promise<void> => {
      const res = await PZService.business.getOnlineAppointmentOverview()
      data.value = res?.map(item => {
        return {
          type: item.bookType,
          name: item.enterpriseName,
          time: item.bookTime
        }
      })
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="在线预约和咨询服务">
        <div class='card-container-3' >
          <RollTable column={columns.value} data={data.value} showLength={8}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})