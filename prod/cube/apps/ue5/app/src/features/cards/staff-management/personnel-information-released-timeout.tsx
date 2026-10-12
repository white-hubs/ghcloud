import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { todayTimeoutLeavePage } from "@/infrastructure/api/lingchuanhik";

export const PersonnelInformationReleasedTimeout = defineComponent({
  name: "PersonnelInformationReleasedTimeout",
  setup(_props, ctx) {
    const columns = ref([
      {
        title: "姓名",
        dataIndex: "name",
      },
      {
        title: "带领老师",
        dataIndex: "bringPoliceName",
      },
      {
        title: "进校事由 ",
        dataIndex: "visitReasonName",
      },
    ]);
    const data = ref<any>([]);
    const getTodayTimeoutLeavePage = async () => {
      const res = await todayTimeoutLeavePage({ pageSize: 10, pageNum: 1 });
      data.value = res.records;
    };
    onMounted(() => {
      getTodayTimeoutLeavePage();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="超时未出人员信息">
        {" "}
        <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
      </SubPanelTemplate>
    );
  },
});

export default PersonnelInformationReleasedTimeout;
