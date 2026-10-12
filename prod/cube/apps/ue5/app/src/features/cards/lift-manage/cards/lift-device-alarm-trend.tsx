import { defineComponent } from "vue";
import { ref } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsStatus, statisticsTrend } from "@/infrastructure/api/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./lift-device-alarm-trend.module.less";

export const LiftDeviceAlarmTrend = defineComponent({
  name: "LiftDeviceAlarmTrend",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const topTimeFrame = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });

    // 报警状态统计&报警趋势折线图统计
    async function getAlarmsNumber() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      xData.value.length = 0;
      yData.value.length = 0;
      let Status = await statisticsStatus(params);
      let Trend = await statisticsTrend(params);
      alarmCon.value = {
        count: Status.alarmNum,
        ratio: Status.chainRatio,
      };
      Trend.forEach((item: any) => {
        let time = "";
        if (params.type === "TODAY") {
          time = "时";
        } else if (params.type === "THIS_YEAR") {
          time = "月";
        } else {
          time = "号";
        }
        xData.value.push(item.period + time);
        yData.value.push(item.alarmNum);
      });
    }

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备报警趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={topTimeFrame.value}
              onUpdate:modelValue={(v) => {
                topTimeFrame.value = v;
              }}
              onSearch={getAlarmsNumber}
            ></DateInlineForm>
          </template>
          <div class="body">
            <OperateDays title="报警数" value={alarmCon.value.count} class="body-num">
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
              </div>
            </OperateDays>
            <div class="chart">
              <LineChart
                x-data={xData.value}
                series={[
                  {
                    data: yData,
                    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                  },
                ]}
              />
            </div>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LiftDeviceAlarmTrend;
