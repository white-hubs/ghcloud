import moment from "moment";
import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationEvent } from "@/infrastructure/api/door";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export const TrafficData = defineComponent({
  name: "TrafficData",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const columns = ref([
      {
        title: "时间",
        dataIndex: "eventTime",
        width: 120,
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
      },
      {
        title: "通行方式",
        dataIndex: "eventWay",
      },
    ]);
    const data = ref<any>([]);
    // 实时通行数据
    const realTimeTrafficData = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageNumber: 1,
        pageSize: 50,
      };
      let res = await visualizationEvent(param);
      res.records.forEach((item) => {
        item.eventTime = moment(item.eventTime).format("YYYY-MM-DD HH:mm:ss");
      });
      data.value = res.records.filter((item) => {
        if (moment(item.eventTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
          return item;
        }
      });
    };
    onMounted(() => {
      realTimeTrafficData();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="实时通行数据" class="alarm-event">
        {" "}
        <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
      </SubPanelTemplate>
    );
  },
});

export default TrafficData;
