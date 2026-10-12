import { defineComponent } from "vue";
import { ref } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./public-equipment-processing-trends.module.less";

export const PublicEquipmentProcessingTrends = defineComponent({
  name: "PublicEquipmentProcessingTrends",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const hiddenDangerTime = ref<ModelValueItf>();
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
    const xData = ref<string[]>(["12-4", "12-5", "12-6", "12-7", "12-8"]);
    const yData = ref<number[]>([1, 2, 3, 4, 5]);
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: hiddenDangerTime.value.dateRange.join(","),
        type: hiddenDangerTime.value.timeType,
      };

      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData.value = data.alarmStatusStatistics;
      alarmCon.value.count = data.alarmNum;
      alarmCon.value.ratio = data.chainRatio;
      xData.value = res.xdata;
      yData.value = res.ydata;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备报警趋势" zoomable zoom-title="设备报警趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={hiddenDangerTime.value}
              onUpdate:modelValue={(v) => {
                hiddenDangerTime.value = v;
              }}
              onSearch={alarmTrendInfo}
              data-no-zoom
            ></DateInlineForm>
          </template>
          <div class="body-bum" data-no-zoom>
            <OperateDays title="报警数" value={alarmCon.value.count}>
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
              </div>
            </OperateDays>
          </div>
          <GridContainer data={alarmStatusData.value} data-no-zoom></GridContainer>
          <div class="chart" data-no-zoom>
            <LineChart
              x-data={xData.value}
              series={[
                {
                  name: "报警数",
                  data: yData,
                  linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                },
              ]}
            />
          </div>
          <template>
            <div class="zoom-trend-content">
              <div class="zoom-body-bum" data-no-zoom>
                <OperateDays title="报警数" value={alarmCon.value.count} class="zoom-operate-days">
                  <div class="extra flex-start">
                    <div class="mode"> 环比</div>
                    <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                    <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
                  </div>
                </OperateDays>
              </div>
              <GridContainer data={alarmStatusData.value} class="zoom-grid-container" data-no-zoom></GridContainer>
              <div class="zoom-chart" data-no-zoom>
                <LineChart
                  x-data={xData.value}
                  series={[
                    {
                      name: "报警数",
                      data: yData,
                      linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                    },
                  ]}
                  height={320}
                />
              </div>
            </div>
          </template>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PublicEquipmentProcessingTrends;
