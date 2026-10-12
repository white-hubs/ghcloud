import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RoundPie from "@/features/cards/medical-gas/components/round-pie";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { usageStatByArea, usageStatByType, usageStatByTypeAndTime } from "@/infrastructure/api/securitymanagement";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const alarmTypeTime = ref<ModelValueItf>();
    const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const dosageTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const xDataGas = ref<string[]>([]);
    const titles = ref([]);
    const yDataGas = ref<
      {
        name: string;
        data: number[];
        linearGradientColor?: string[];
        lineColor?: string;
        showSymbol?: boolean;
        smooth?: boolean;
        symbolSize?: number;
      }[]
    >([]);
    const pieData = ref<{ name: string; value: number }[]>([]);
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const areaAlarmStatistic = async () => {
      const params = {
        period: alarmTypeTime.value.dateRange.join(","),
        type: alarmTypeTime.value.timeType,
      };
      const res = await usageStatByType(params);
      xData.value.length = 0;
      yData.value.length = 0;
      res.forEach((item) => {
        xData.value.push(item.waterTypeName);
        yData.value.push(item.totalUsage);
      });
    };
    const getGasData = async () => {
      const params = {
        period: gasTime.value.dateRange.join(","),
        type: gasTime.value.timeType,
      };
      const res = await usageStatByTypeAndTime(params);
      yDataGas.value.length = 0;
      xDataGas.value = res[0]?.list.map((item) => item.dateHour);
      titles.value = res.map((item) => item.waterTypeName);
      res.forEach((item) => {
        const data = item.list.map((data) => data.totalUsage);
        yDataGas.value.push({ name: item.waterTypeName, data });
      });
    };
    const getDosageData = async () => {
      const params = {
        period: dosageTime.value.dateRange.join(","),
        type: dosageTime.value.timeType,
      };
      const res = await usageStatByArea(params);
      pieData.value = res.map((item) => {
        return {
          name: item.areaName,
          value: item.totalUsage,
        };
      });
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="净水用量情况">
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
              <barChart title={""} x-data={xData.value} data={[{ color: "#1890FF", name: "", data: yData }]} class="columnBox" />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="净水使用趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={gasTime.value}
                onUpdate:modelValue={(v) => {
                  gasTime.value = v;
                }}
                onSearch={getGasData}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                x-data={xDataGas.value}
                series={yDataGas.value}
                showLegend={true}
                showBackground={true}
                titles={titles.value}
                gridTop="15"
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="区域使用量概况" class="visiting-data">
            <template>
              {" "}
              <DateInlineForm
                modelValue={dosageTime.value}
                onUpdate:modelValue={(v) => {
                  dosageTime.value = v;
                }}
                onSearch={getDosageData}
              ></DateInlineForm>
            </template>
            {pieData.length && (
              <div class="chart">
                {" "}
                <RoundPie pieData={pieData.value} />
              </div>
            )}
            <noData></noData>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
