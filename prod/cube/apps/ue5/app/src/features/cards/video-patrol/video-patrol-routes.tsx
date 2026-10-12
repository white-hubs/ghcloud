import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cameraPatrolLines } from "@/infrastructure/api/vmonitor";
import bus from "@/infrastructure/utils/bus";

import styles from "./video-patrol-routes.module.less";

export const VideoPatrolRoutes = defineComponent({
  name: "VideoPatrolRoutes",
  setup(_props, ctx) {
    const numberPasses = ref(0);
    const columns = ref([
      {
        title: "巡逻路线",
        dataIndex: "eventTime",
        width: 120,
      },
      {
        title: "监控点位",
        dataIndex: "doorName",
      },
      {
        title: "操作",
        dataIndex: "operate",
        slots: {
          customRender: "operate",
        },
      },
    ]);
    const patrolRoute = ref([]);
    const goDetails = (value) => {
      bus.emit("setPanel", {
        ...value,
        rightPanelName: "PatrolRouteDetails",
        leftPanelName: "",
      });
    };
    const getCameraPatrolLines = async () => {
      const res = await cameraPatrolLines({
        pageNumber: 1,
        pageSize: 50,
      });
      numberPasses.value = res.total;
      patrolRoute.value = res.records.map((e) => {
        return {
          eventTime: e.name,
          doorName: e.cameraNum,
          ...e,
        };
      });
    };
    onMounted(() => {
      getCameraPatrolLines();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="视频巡逻路线">
          <div class="operateDays">
            {" "}
            <OperateDays value={numberPasses.value} title="巡逻路线"></OperateDays>
          </div>
          <div class="operateTable">
            {" "}
            <RollTable column={columns.value} data={patrolRoute.value} showLength={8}>
              {" "}
              <template>
                {" "}
                <div class="operate" onClick={goDetails(record)}>
                  {" "}
                  巡逻
                </div>
              </template>
            </RollTable>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default VideoPatrolRoutes;
