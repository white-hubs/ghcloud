import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import WaterTreatmentRealtime from "./cards/water-treatment-realtime";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsAreaTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop, AlarmStatus } from "@/infrastructure/api/models/alarm";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const topTimeFrame = ref<ModelValueItf>();
    const handleTime = ref<ModelValueItf>();
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const alarmInfo = reactive({
      count: 0,
      ratio: 0,
    });

    const alarmStatusData = ref<AlarmStatus[]>([
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "处理中",
        color: "#FFC700",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "挂起",
        color: "#74AEE7",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "已处理",
        color: "#00F27B",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "待确认",
        color: "#29C2FF",
      },
    ]);
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
      let res: any = await alarmTrend(params);
      let data: any = await equipmentNumber(params);
      alarmStatusData.value = data.alarmStatusStatistics;
      xData.value = res.xdata;
      yData.value = res.ydata;
      Object.assign(alarmInfo, {
        count: data.alarmNum,
        ratio: data.chainRatio,
      });
    }
    /**
     * 区域报警Top5
     */
    const areaAlarmStatistic = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      areaAlarmRank.value = await statisticsAreaTop(params);
    };

    return (): JSX.Element => (
      <>
        <div>
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
              <OperateDays title="报警数" value={alarmInfo.value.count} class="body-num">
                <div class="ringRatio">
                  <span> 环比</span>
                  <div class={["downtriangle", alarmInfo.ratio > 0 && "uptriangle"]}></div>
                  <div class={[alarmInfo.ratio > 0 ? "up" : "down"]}> {alarmInfo.ratio + "%"}</div>
                </div>
              </OperateDays>
              <GridContainer data={alarmStatusData.value}></GridContainer>
              <div class="chart">
                <LineChart
                  gridTop={"0"}
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
          <SubPanelTemplate title="事件区域top5" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={areaAlarmStatistic}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 190px">
              {areaAlarmRank.map((item, index) => (
                <EventAlarmItem
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
          </SubPanelTemplate>
          <WaterTreatmentRealtime />
        </div>
      </>
    );
  },
});

export default Right;
