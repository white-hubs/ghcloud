import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cameraPatrolStatisticsCameraPointn } from "@/infrastructure/api/vmonitor";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-personnel-point-statistics.module.less";

export const PatrolPersonnelPointStatistics = defineComponent({
  name: "PatrolPersonnelPointStatistics",
  setup(_props, ctx) {
    const alarmTypeTime = ref<ModelValueItf>();
    const barData = reactive({
      xData: [],
      yData: [
        {
          data: [],
          name: "点位",
          color: ["rgba(42, 232, 189, 0.80)", "rgba(42, 232, 189, 0)"],
        },
      ],
    });
    const areaAlarmStatistic = async () => {
      const res = await cameraPatrolStatisticsCameraPointn({ period: alarmTypeTime.value.dateRange.join(",") });
      barData.xData = res.map((e) => e.userName);
      barData.yData[0].data = res.map((e) => e.patrolCameraCount);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="巡逻人员点位统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmTypeTime.value}
              onUpdate:modelValue={(v) => {
                alarmTypeTime.value = v;
              }}
              onSearch={areaAlarmStatistic}
            ></DateInlineForm>
          </template>
          <div class="chart">
            {" "}
            <overviewChartBar bottom={"0%"} xData={barData.xData} yData={barData.yData}></overviewChartBar>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PatrolPersonnelPointStatistics;
