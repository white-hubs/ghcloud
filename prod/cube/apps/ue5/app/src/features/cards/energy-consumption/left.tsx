import { defineComponent } from "vue";
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";

import VisitingDataPic from "@/features/cards/triage-queue/components/visiting-data-pic";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { energyTrend, energyProject, comprehensiveEnergy } from "@/infrastructure/api/energy";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const workOrderTime = ref<ModelValueItf>();
    const energyConsumption = ref<ModelValueItf>();
    const energyUsageTime = ref<ModelValueItf>();
    let timer = null;
    // 群控组实时数据
    const visitingData = ref([
      { title: "综合能耗tce", value: 450, img: getAssetsImage("overView43.png"), ratio: 0.5 },
      { title: "碳排量kg CO₂e", value: 607, img: getAssetsImage("overView12.png"), ratio: 0.5 },
    ]);
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });
    const total = ref(0);
    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const energyAnalysis = ref([
      {
        data: [],
        title: "电力",
      },
      {
        data: [],
        title: "水",
      },
    ]);
    // 用能分析
    const changeAppointmentTime = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        timeFlag: changeTime(energyUsageTime.value.timeType),
      };
      // 电表
      let electricity: any = await energyProject(Object.assign(params, { instrumentType: "electricity_meter" }));
      energyAnalysis.value[0].data = electricity.list.map((item: any, index) => {
        return {
          label: item.projectName,
          value: item.value,
          color: colorList[index],
        };
      });
      // 水表
      let water: any = await energyProject(Object.assign(params, { instrumentType: "water_meter" }));
      energyAnalysis.value[1].data = water.list.map((item: any, index) => {
        return {
          label: item.projectName,
          value: item.value,
          color: colorList[index],
        };
      });
    };
    // 能碳概览
    const changeHandleworkOrderTime = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        timeFlag: changeTime(workOrderTime.value.timeType),
      };
      let res = await comprehensiveEnergy(params);
      visitingData.value[0].value = res.energyCoal;
      visitingData.value[0].ratio = res.energyCoalRatio;
      visitingData.value[1].value = res.energyCarbon;
      visitingData.value[1].ratio = res.energyCarbonRatio;
    };
    // 综合能耗趋势
    const changeHandleEnergyConsumptionTime = async () => {
      const { timeType } = energyConsumption.value;
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        timeFlag: changeTime(timeType),
      };
      let res = await energyTrend(params);
      receptionTrendsChartData.xData = res.map((item) => {
        if (changeTime(timeType) === "Day") {
          item.timeFlag += "时";
        } else if (changeTime(timeType) === "Year") {
          item.timeFlag += "月";
        } else if (changeTime(timeType) === "Month" || changeTime(timeType) === "Week") {
          item.timeFlag += "日";
        } else {
          item;
        }
        return item.timeFlag;
      });
      receptionTrendsChartData.yData[0].data = res.map((item) => {
        return item.value;
      });
    };
    const changeTime = (time) => {
      if (time === "TODAY") {
        return "Day";
      } else if (time === "THIS_WEEK") {
        return "Week";
      } else if (time === "THIS_MONTH") {
        return "Month";
      } else if (time === "THIS_YEAR") {
        return "Year";
      }
    };
    const init = () => {
      changeHandleworkOrderTime();
      changeHandleEnergyConsumptionTime();
      changeAppointmentTime();
    };
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        init();
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
      },
    );

    onMounted(() => {
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="能碳概览" class="visiting-data">
            <template>
              {" "}
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                onSearch={changeHandleworkOrderTime}
              ></DateInlineForm>
            </template>
            {visitingData.map((item) => (
              <div class="item" key={item.title}>
                <VisitingDataPic img={item.img} />
                <a-statistic title={item.title}>
                  <template>
                    <count-to startVal={0} endVal={item.value} duration={2000} separator></count-to>
                    <div class="ringRatio">
                      <span> 环比</span>
                      <div class={["downtriangle", item.ratio > 0 && "uptriangle"]}></div>
                      <div class={[item.ratio > 0 ? "up" : "down"]}> {item.ratio + "%"}</div>
                    </div>
                  </template>
                </a-statistic>
              </div>
            ))}
          </SubPanelTemplate>
          <SubPanelTemplate title="综合能耗趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyConsumption.value}
                onUpdate:modelValue={(v) => {
                  energyConsumption.value = v;
                }}
                onSearch={changeHandleEnergyConsumptionTime}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                x-data={receptionTrendsChartData.xData}
                series={receptionTrendsChartData.yData}
                showLegend={false}
                gridTop="15"
                unit={{ x: "", y: "能耗" }}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="用能分析">
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyUsageTime.value}
                onUpdate:modelValue={(v) => {
                  energyUsageTime.value = v;
                }}
                onSearch={changeAppointmentTime}
              ></DateInlineForm>
            </template>
            {energyAnalysis.map((item) => (
              <div class="flex-between analysis" key={item.title}>
                <PlanPie pieData={item.data}>
                  {" "}
                  <div class="content">
                    {" "}
                    <div> {item.title}</div>
                  </div>
                </PlanPie>
                <PieList class="pieList" roundPieData={item.data}></PieList>
              </div>
            ))}
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
