import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import AlarmStatistics from "../triage-queue/components/alarm-statistics";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getElectricityTrend, getWaterTrend, getTemperatureTrend, getDataOverView } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeArea } from "@/visualization-core/stores/area";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    // 前端模拟数据
    const demoData = {
      机组1: [
        { timeFlag: "08", deviceName: "机组1", dataValue: 2.3 },
        { timeFlag: "03", deviceName: "机组1", dataValue: 1.3 },
        { timeFlag: "02", deviceName: "机组1", dataValue: 3.3 },
        { timeFlag: "01", deviceName: "机组1", dataValue: 4.3 },
      ],
      机组2: [{ timeFlag: "02", deviceName: "机组1", dataValue: 2.3 }],
      机组3: [{ timeFlag: "04", deviceName: "机组1", dataValue: 2.3 }],
    };
    const { globalState } = useStateStore();
    const overviewTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const RunTimeTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const energyTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const waterTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const state = reactive({
      alarmData: [
        { eventName: "用水量", value: 0, rate: 0, color: "#F14545" },
        { eventName: "用电量", value: 0, rate: 0, color: "#FFC700" },
      ],
      temperTrendData: {
        xData: [],
        data: [],
        title: [],
      },
      useWaterTrendData: {
        xData: [],
        data: [],
        title: [],
      },
      electricityTrend: {
        xData: [],
        data: [],
        title: [],
      },
    });
    const xData = ref<string[]>(["1", "2", "3", "4", "5"]);
    const series = ref([
      {
        name: "11",
        data: [1, 2, 3, 4, 5, 5],
      },
    ]);
    // 数据概览
    const changeOverviewTimeTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: overviewTime.value.dateRange.join(","),
        type: overviewTime.value.timeType,
      };
      const result = await getDataOverView(param);
      state.alarmData[0].value = result.waterValue as number;
      state.alarmData[0].rate = result.waterRate as number;
      state.alarmData[1].value = result.electricityValue as number;
      state.alarmData[1].rate = result.electricityRate as number;
    };
    // 温度趋势
    const changeRunTimeTimeTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: RunTimeTime.value.dateRange.join(","),
        type: RunTimeTime.value.timeType,
      };
      const result = await getTemperatureTrend(param);
      const dataMap = Object.keys(result.dataMap).length ? result.dataMap : demoData;
      const dataValue = handleDataMap(result.xtitle, result.dataMap);
      state.temperTrendData.xData = result.xtitle.map((item) => {
        if (RunTimeTime.value.timeType === "TODAY") {
          return (item += "时");
        } else if (RunTimeTime.value.timeType === "THIS_YEAR") {
          return (item += "月");
        } else {
          return item;
        }
      });
      state.temperTrendData.data = dataValue;
      state.temperTrendData.title = Object.keys(result.dataMap);
    };
    // 用水趋势
    const changeWaterTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: waterTime.value.dateRange.join(","),
        type: waterTime.value.timeType,
      };

      const result = await getWaterTrend(param);
      const dataMap = Object.keys(result.dataMap).length ? result.dataMap : demoData;
      const dataValue = handleDataMap(result.xtitle, result.dataMap);
      state.useWaterTrendData.xData = result.xtitle.map((item) => {
        if (waterTime.value.timeType === "TODAY") {
          return (item += "时");
        } else if (waterTime.value.timeType === "THIS_YEAR") {
          return (item += "月");
        } else {
          return item;
        }
      });
      state.useWaterTrendData.data = dataValue;
      state.useWaterTrendData.title = Object.keys(result.dataMap);
    };
    // 处理数据
    const handleDataMap = (xData: string[], dataMap: any) => {
      return Object.keys(dataMap).map((item) => {
        return {
          name: item,
          data: xData.map((xItem) => {
            return dataMap[item].find((item) => item.timeFlag === xItem)
              ? dataMap[item].find((item) => item.timeFlag === xItem).dataValue
              : 0;
          }),
        };
      });
    };
    // 能耗趋势
    const changeEnergyTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: energyTime.value.dateRange.join(","),
        type: energyTime.value.timeType,
      };

      const result = await getElectricityTrend(param);
      const dataMap = Object.keys(result.dataMap).length ? result.dataMap : demoData;
      const dataValue = handleDataMap(result.xtitle, result.dataMap);
      state.electricityTrend.xData = result.xtitle.map((item) => {
        if (energyTime.value.timeType === "TODAY") {
          return (item += "时");
        } else if (energyTime.value.timeType === "THIS_YEAR") {
          return (item += "月");
        } else {
          return item;
        }
      });
      state.electricityTrend.data = dataValue;
      state.electricityTrend.title = Object.keys(result.dataMap);
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="数据概览">
            <template>
              {" "}
              <DateInlineForm
                modelValue={overviewTime.value}
                onUpdate:modelValue={(v) => {
                  overviewTime.value = v;
                }}
                onSearch={changeOverviewTimeTime}
              ></DateInlineForm>
            </template>
            <AlarmStatistics statisticsData={state.alarmData} />
          </SubPanelTemplate>
          <SubPanelTemplate title="实时温度趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={RunTimeTime.value}
                onUpdate:modelValue={(v) => {
                  RunTimeTime.value = v;
                }}
                onSearch={changeRunTimeTimeTime}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                titles={state.temperTrendData.title}
                gridTop={"10"}
                showLegend={true}
                x-data={state.temperTrendData.xData}
                series={state.temperTrendData.data}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="用水趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={waterTime.value}
                onUpdate:modelValue={(v) => {
                  waterTime.value = v;
                }}
                onSearch={changeWaterTime}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                titles={state.useWaterTrendData.title}
                gridTop={"10"}
                showLegend={true}
                x-data={state.useWaterTrendData.xData}
                series={state.useWaterTrendData.data}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="用电趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyTime.value}
                onUpdate:modelValue={(v) => {
                  energyTime.value = v;
                }}
                onSearch={changeEnergyTime}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                titles={state.electricityTrend.title}
                gridTop={"10"}
                showLegend={true}
                x-data={state.electricityTrend.xData}
                series={state.electricityTrend.data}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
