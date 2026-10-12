import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./logistics-device-alarm-trend.module.less";

export const LogisticsDeviceAlarmTrend = defineComponent({
  name: "LogisticsDeviceAlarmTrend",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const trend = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    let alarmStatusData = reactive([]);
    const alarmNum = ref<number>(0);
    const chainRatio = ref<number>(0);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);

    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData = data.alarmStatusStatistics;
      alarmNum.value = data.alarmNum;
      chainRatio.value = data.chainRatio;
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备报警趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={trend.value}
              onUpdate:modelValue={(v) => {
                trend.value = v;
              }}
              onSearch={alarmTrendInfo}
            ></DateInlineForm>
          </template>
          <OperateDays value={alarmNum.value} title="报警总数">
            <div class="ringRatio">
              <span> 环比</span>
              <div class={["downtriangle", chainRatio > 0 && "uptriangle"]}></div>
              <div class={[chainRatio > 0 ? "up" : "down"]}> {chainRatio + "%"}</div>
            </div>
          </OperateDays>
          <GridContainer style="margin-top: 12px" data={alarmStatusData}></GridContainer>
          <div class="charts">
            {" "}
            <LineChart x-data={xData.arr} series={series} title={"次"}></LineChart>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LogisticsDeviceAlarmTrend;
