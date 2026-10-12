import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

export const DeviceFacilities = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "设备名称",
        dataIndex: "name",
      },
      {
        title: "保养时间",
        dataIndex: "time",
      },
    ]);
    const data = ref([
      { name: "设备1", time: "2025-01-01" },
      { name: "设备2", time: "2025-02-02" },
      { name: "设备3", time: "2025-03-03" },
      { name: "设备4", time: "2025-04-04" },
      { name: "设备5", time: "2024-05-05" },
    ]);
    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-2' >
          <RollTable column={columns.value} data={data.value} autoScroll={false} showLength={5}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})

