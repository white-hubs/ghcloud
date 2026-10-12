import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { passengerFlowMuseum, passengerFlowRegions, passengerFlowStatistics } from "@/infrastructure/api/passenger-flow";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const handleTime = ref<ModelValueItf>();
    const enterTime = ref<ModelValueItf>();
    const receptionTrendsChartData = reactive({
      xData: [],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });

    //实时人数===========================================================================
    const passenger = ref([
      {
        title: "实时人数",
        value: 0,
      },
      {
        title: "进馆",
        value: 0,
        ratio: 0,
      },
      {
        title: "出馆",
        value: 0,
        ratio: 0,
      },
    ]);
    const getPassengerFlowStatistics = async () => {
      const date = [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",");
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: date,
      };
      const res = await passengerFlowStatistics(params);
      passenger.value[0].value = res.inMuseum;
      passenger.value[1].value = res.inCount;
      passenger.value[2].value = res.outCount;
    };
    //客流量排名====================================================================
    const areaChart = reactive({
      xData: [],
      yData: [],
    });
    const getPassengerFlowRegions = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
      };
      const res = await passengerFlowRegions(params);
      areaChart.xData = [];
      areaChart.yData = [];
      res.forEach((item, index) => {
        areaChart.xData.push(item.areaName);
        areaChart.yData.push(item.num);
      });
    };
    //在馆客流分析======================================================
    const getPassengerFlowMuseum = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: enterTime.value.dateRange.join(","),
        type: enterTime.value.timeType,
      };
      receptionTrendsChartData.xData = [];
      const res = await passengerFlowMuseum(params);
      receptionTrendsChartData.xData = res.xtitle;
      receptionTrendsChartData.yData[0].data = [];
      res.analysis.forEach((item, index) => {
        receptionTrendsChartData.yData[0].data.push(item.num);
      });
    };

    onMounted(() => {
      getPassengerFlowStatistics();
      getPassengerFlowRegions();
      getPassengerFlowMuseum();
    });

    return (): JSX.Element => (
      <>
        <div>
          <div class="passenger-flow">
            {passenger.map((item, index) => (
              <div class="passenger-flow-box" key={item.title}>
                <div class="passenger-flow-title"> {item.title}</div>
                <div class="passenger-flow-value">
                  <CountTo startVal={0} endVal={item.value} duration={2000} separator />
                  <div class="ringRatio">
                    <div class={["downtriangle", (item.ratio as number) > 0 && "uptriangle"]}></div>
                    <div class={[(item.ratio as number) > 0 ? "up" : "down"]}> {item.ratio + "%"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <SubPanelTemplate title="各区域客流量排名Top10">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={getPassengerFlowRegions}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <barChart
                title={""}
                x-data={areaChart.xData}
                max={9}
                inverse
                data={[{ color: "#1890FF", name: "人次", data: areaChart.yData }]}
                class="columnBox"
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="客流分析图">
            <template>
              {" "}
              <DateInlineForm
                modelValue={enterTime.value}
                onUpdate:modelValue={(v) => {
                  enterTime.value = v;
                }}
                onSearch={getPassengerFlowMuseum}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                x-data={receptionTrendsChartData.xData}
                series={receptionTrendsChartData.yData}
                showLegend={false}
                gridTop="20"
                unit={{ x: "", y: "人次" }}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
