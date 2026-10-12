import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { personRollCallPage } from "@/infrastructure/api/lingchuanhik";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export const TodayDormitoryRollCallSituation = defineComponent({
  name: "TodayDormitoryRollCallSituation",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const columns = ref([
      {
        title: "宿舍",
        dataIndex: "orgName",
      },
      {
        title: "姓名",
        dataIndex: "personName",
      },
      {
        title: "点名情况",
        dataIndex: "status",
      },
      {
        title: "备注",
        dataIndex: "remark",
      },
    ]);
    const data = ref<any>([]);

    const getPersonRollCallPage = async () => {
      const res = await personRollCallPage({
        pageNumber: 1,
        pageSize: 20,
        areaId: globalState.business.currentAreaId,
      });
      data.value = res.records.map((e) => {
        return {
          ...e,
          status: e.status == "1" ? "已到" : "未到",
        };
      });
    };
    onMounted(() => {
      getPersonRollCallPage();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="今日宿舍点名情况">
        {" "}
        <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
      </SubPanelTemplate>
    );
  },
});

export default TodayDormitoryRollCallSituation;
