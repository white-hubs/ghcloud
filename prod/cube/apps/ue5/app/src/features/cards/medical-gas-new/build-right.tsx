import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RoundPie from "@/features/cards/medical-gas/components/round-pie";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./build-right.module.less";

export const BuildRight = defineComponent({
  name: "BuildRight",
  setup(_props, ctx) {
    const titles = ["氧气", "二氧化碳"];
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const dosageTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const pieData = ref<{ name: string; value: number }[]>([
      {
        name: "手术室",
        value: 45,
      },
      {
        name: "预麻室",
        value: 50,
      },
      {
        name: "恢复室",
        value: 20,
      },
      {
        name: "清创室",
        value: 20,
      },
      {
        name: "妇产科科室",
        value: 30,
      },
      {
        name: "ICU科室",
        value: 50,
      },
    ]);
    const listData = ref<{ label: string; value: number; ratio: number }[]>([]);
    const xDataGas = ref<string[]>(["1", "2", "3", "4"]);
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
    >([
      {
        name: "氧气",
        data: [31, 12, 3, 24, 5],
      },
      {
        name: "二氧化碳",
        data: [12, 2, 23, 4, 25],
      },
    ]);

    const getTemplateData = () => {};
    const getGasData = () => {};
    const getDosageData = () => {};

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="气体用量情况">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trendTime.value}
                onUpdate:modelValue={(v) => {
                  trendTime.value = v;
                }}
                onSearch={getTemplateData}
              ></DateInlineForm>
            </template>
            <div class="body chart">
              {listData.map((item, index) => (
                <EventAlarmItem sort={index + 1} name={item.label} count={item.value} ratio={item.ratio.toFixed(2) + "%"} modes={"次"} />
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="气体使用趋势">
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
                titles={titles}
                gridTop="15"
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="科室使用量概况" class="visiting-data">
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
            <div class="chart">
              {" "}
              <RoundPie pieData={pieData.value} />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default BuildRight;
