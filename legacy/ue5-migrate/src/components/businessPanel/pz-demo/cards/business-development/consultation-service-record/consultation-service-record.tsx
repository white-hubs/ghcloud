import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'

export const ConsultationServiceRecord = defineComponent({
  name: 'ConsultationServiceRecord',
  setup () {
    const columns = ref([
      {
        title: "服务类型",
        dataIndex: "type",
      },
      {
        title: "服务时间",
        dataIndex: "type",
      },
      {
        title: "服务对象名称",
        dataIndex: "name",
      },
    ]);
    const data = ref([
      {
        type: "法律咨询",
        time: "2024-01-01 09:00",
        name: "张三"
      },
      {
        type: "医疗咨询",
        time: "2024-01-02 14:30",
        name: "李四"
      },
      {
        type: "财务咨询",
        time: "2024-01-03 11:15",
        name: "王五"
      },
      {
        type: "职业咨询",
        time: "2024-01-04 16:45",
        name: "赵六"
      },
      {
        type: "教育咨询",
        time: "2024-01-05 10:20",
        name: "孙七"
      },
      {
        type: "法律咨询",
        time: "2024-01-06 13:55",
        name: "周八"
      },
      {
        type: "医疗咨询",
        time: "2024-01-07 17:30",
        name: "吴九"
      },
      {
        type: "财务咨询",
        time: "2024-01-08 12:40",
        name: "郑十"
      }
    ]);
    const getData = async (): Promise<void> => {
      const res = await PZService.business.getConsultationServiceRecord()
      data.value = res?.map(item => {
        return {
          type: item.advisoryType,
          name: item.serviceUser,
          time: item.serviceTime
        }
      })
    }

    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate title="在线预约和咨询服务">
        <div class='card-container-3' >
          <RollTable column={columns.value} data={data.value}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})