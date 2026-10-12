import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { hikCriminalPage } from "@/infrastructure/api/lingchuanhik";

import styles from "./list-high-risk-personnel.module.less";

export const ListHighRiskPersonnel = defineComponent({
  name: "ListHighRiskPersonnel",
  setup(_props, ctx) {
    const columns = ref([
      {
        title: "姓名",
        dataIndex: "name",
      },
      {
        title: "所在位置",
        dataIndex: "address",
      },
      {
        title: "风险等级",
        dataIndex: "riskLevel",
      },
      {
        title: "风险原因",
        dataIndex: "riskReason",
      },
    ]);
    const data = ref<any>([]);
    const getHikCriminalPage = async () => {
      const res = await hikCriminalPage({ riskLevel: "高风险" });
      data.value = res.records;
    };
    onMounted(() => {
      getHikCriminalPage();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="高风险学生列表">
        {" "}
        <div class="list-high-risk-personnel">
          {" "}
          <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default ListHighRiskPersonnel;
