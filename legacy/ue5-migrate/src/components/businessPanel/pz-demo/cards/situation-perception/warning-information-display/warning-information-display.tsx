import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

export const WarningInformationDisplay = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "预警等级",
        dataIndex: "lv",
      },
      {
        title: "预警内容",
        dataIndex: "content",
      },
      {
        title: "预警时间",
        dataIndex: "time",
      },
    ]);
    const data = ref([
      { lv: "一级预警", content: "预警内容1", time: "2024-01-01 08:00" },
      { lv: "二级预警", content: "预警内容2", time: "2024-01-02 09:00" },
      { lv: "三级预警", content: "预警内容3", time: "2024-01-03 10:00" },
      { lv: "一级预警", content: "预警内容4", time: "2024-01-04 11:00" },
      { lv: "二级预警", content: "预警内容5", time: "2024-01-05 12:00" },
    ]);
    return (): JSX.Element => (
      <SubPanelTemplate title="预警信息展示">
        <div class='card-container-2' >
          <RollTable column={columns.value} data={data.value} autoScroll={false} showLength={5}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})