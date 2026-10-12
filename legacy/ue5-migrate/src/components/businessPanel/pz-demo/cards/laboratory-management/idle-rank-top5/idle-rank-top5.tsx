import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'


export const IdleRankTop5 = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "设备名称",
        dataIndex: "name",
      },
      {
        title: "空闲时长",
        dataIndex: "time",
      },
    ]);
    const data = ref([]);
    PZService.laboratory.getTop5IdleRanking().then(res => {
      data.value = res.map(item => {
        // 将毫秒转换为 xx小时xx分钟 格式
        const hours = Math.floor(item.idleTime / (1000 * 60 * 60));
        const minutes = Math.floor((item.idleTime % (1000 * 60 * 60)) / (1000 * 60));
        return {
          name: item.deviceName || '--',
          time: `${hours}小时${minutes}分钟`
        }
      })
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