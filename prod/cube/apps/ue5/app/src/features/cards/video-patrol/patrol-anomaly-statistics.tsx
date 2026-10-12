import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cameraPatrolStatisticsAbnormalTrend } from "@/infrastructure/api/vmonitor";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./patrol-anomaly-statistics.module.less";

export const PatrolAnomalyStatistics = defineComponent({
  name: "PatrolAnomalyStatistics",
  setup(_props, ctx) {
    const trend = ref();
    const xData = ref([]);
    const series = reactive([
      {
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const getAlarmTrend = async () => {
      const res = await cameraPatrolStatisticsAbnormalTrend({
        patrolResult: "CAMERA_PATROL_ABNORMAL",
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      });
      xData.value = res.map((e) => e.period);
      series[0].data = res.map((e) => e.totalNum);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="巡逻异常统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={trend.value}
              onUpdate:modelValue={(v) => {
                trend.value = v;
              }}
              onSearch={getAlarmTrend}
            ></DateInlineForm>
          </template>
          <LineChart class="chart" x-data={xData.value} series={series}></LineChart>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PatrolAnomalyStatistics;
