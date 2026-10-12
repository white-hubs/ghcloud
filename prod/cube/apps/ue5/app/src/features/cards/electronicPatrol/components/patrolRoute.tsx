import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { routeList } from "@/infrastructure/api/maintain";

import styles from "./patrolRoute.module.less";

export const PatrolRoute = defineComponent({
  name: "PatrolRoute",
  setup(_props, ctx) {
    const routeColumn = [
      {
        title: "巡更路线",
        dataIndex: "patrolRouteName",
        width: 120,
      },
      {
        title: "巡更点数量",
        dataIndex: "patrolLocationNumber",
      },
    ];
    const listData = ref([]);
    const getPatrolRoute = async () => {
      listData.value = await routeList();
    };
    onMounted(() => {
      getPatrolRoute();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="巡更路线">
        {" "}
        <div class="footer">
          {" "}
          <RollTable column={routeColumn} data={listData.value} limitScrollNum={4}></RollTable>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default PatrolRoute;
