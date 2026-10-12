import { defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";

import { EnergyConsumptionTrends, getGasConsumptionData } from "./utils/floor-mock-data";
import VisitingDataPic from "@/features/cards/triage-queue/components/visiting-data-pic";
import StackedBar from "@/features/panel-shell/charts/stacked-bar/stacked-bar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getCurrentAreaInfo, getXaxleData } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./floor-left.module.less";

export const FloorLeft = defineComponent({
  name: "EnergyConsumptionFloorLeft",
  setup() {
    const workOrderTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [""],
    });
    const gasConsumption = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [""],
    });
    const visitingData = ref([
      { title: "电耗 kw·h", value: 33299.0, img: getAssetsImage("overView43.png"), ratio: 10 },
      { title: "水消耗 m³", value: 252001.8, img: getAssetsImage("overView12.png"), ratio: 8 },
      { title: "燃气消耗 m³", value: 1421.8, img: getAssetsImage("overView12.png"), ratio: 8 },
    ]);
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        {
          data: [110, 1350, 1520, 1700, 550, 280],
          linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });
    const gasChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        {
          data: [0, 50, 20, 200, 150, 20],
          linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });
    const alarmStatisticsData = reactive({
      chartData: {
        xData: ["1", "2", "3", "4", "5", "6", "7天"],
        yData: [
          { name: "平时用电量", value: [10, 10, 8, 6, 16, 10, 12], color: "#F14545" },
          { name: "峰时用电量", value: [10, 10, 8, 6, 16, 10, 12], color: "#FFC700" },
          { name: "谷时用电量", value: [10, 10, 8, 6, 16, 10, 12], color: "#2989FF" },
        ],
      },
    });

    const regionInfo = reactive<{ build: string; floor: string }>({
      build: "",
      floor: "",
    });

    let timer: ReturnType<typeof setInterval> | null = null;
    const fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;

    const changeReceptionTrendsTime = (): void => {
      receptionTrendsChartData.yData[0].data = EnergyConsumptionTrends(workOrderTime.value.timeType);
      receptionTrendsChartData.xData = getXaxleData(workOrderTime.value.timeType);
    };

    const changeGasConsumption = (): void => {
      gasChartData.xData = getXaxleData(gasConsumption.value.timeType);
      gasChartData.yData[0].data = getGasConsumptionData(gasConsumption.value.timeType);
    };

    onMounted(() => {
      const res = getCurrentAreaInfo();
      regionInfo.build = res.build;
      regionInfo.floor = res.floor;

      timer = setInterval(
        () => {
          workOrderTime.value.timeType = fakeData[fakeIndex];
          changeReceptionTrendsTime();
          changeGasConsumption();
          fakeIndex += 1;
          if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0;
            if (timer) clearInterval(timer);
          }
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return (): JSX.Element => (
      <div>
        <SubPanelTemplate title="用能概览" class="visiting-data">
          {{
            extra: () => (
              <div class="title">
                {regionInfo.build}
                {regionInfo.floor}
              </div>
            ),
            default: () =>
              visitingData.value.map((item) => (
                <div class="item" key={item.title}>
                  <VisitingDataPic img={item.img} />
                  <a-statistic title={item.title}>
                    {{
                      formatter: () => (
                        <>
                          <CountTo startVal={0} endVal={item.value} duration={2000} separator="" />
                          <div class="ringRatio">
                            <span>环比</span>
                            <div class={["downtriangle", item.ratio > 0 && "uptriangle"]}></div>
                            <div class={[item.ratio > 0 ? "up" : "down"]}>{item.ratio}%</div>
                          </div>
                        </>
                      ),
                    }}
                  </a-statistic>
                </div>
              )),
          }}
        </SubPanelTemplate>

        <SubPanelTemplate title="综合能耗趋势">
          {{
            extra: () => (
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                onSearch={changeReceptionTrendsTime}
              />
            ),
            default: () => (
              <div class="chart">
                <LineChart
                  x-data={receptionTrendsChartData.xData}
                  series={receptionTrendsChartData.yData}
                  showLegend={false}
                  gridTop="15"
                  unit={{ x: "", y: "能耗" }}
                />
              </div>
            ),
          }}
        </SubPanelTemplate>

        <SubPanelTemplate title="电消耗趋势">
          {{
            extra: () => (
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                onSearch={changeReceptionTrendsTime}
              />
            ),
            default: () => (
              <div class="chart">
                <StackedBar xData={alarmStatisticsData.chartData.xData} yData={alarmStatisticsData.chartData.yData} />
              </div>
            ),
          }}
        </SubPanelTemplate>

        <SubPanelTemplate title="燃气消耗趋势">
          {{
            extra: () => (
              <DateInlineForm
                modelValue={gasConsumption.value}
                onUpdate:modelValue={(v) => {
                  gasConsumption.value = v;
                }}
                onSearch={changeGasConsumption}
              />
            ),
            default: () => (
              <div class="chart">
                <LineChart
                  x-data={gasChartData.xData}
                  series={gasChartData.yData}
                  showLegend={false}
                  gridTop="15"
                  unit={{ x: "", y: "能耗" }}
                />
              </div>
            ),
          }}
        </SubPanelTemplate>
      </div>
    );
  },
});

export default FloorLeft;
