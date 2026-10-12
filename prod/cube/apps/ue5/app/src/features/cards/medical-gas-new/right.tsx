import moment from "moment";
import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import RoundDataPic from "@/features/cards/medical-gas/components/round-data-pic";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { gasUsageTrend, todayGasUsage, todayGasUsageTop } from "@/infrastructure/api/device";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
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
    const imgList = ["gas0.png", "gas1.png", "gas2.png", "gas3.png", "gas4.png", "gas5.png"];
    const titles = ref([]);
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const yData = ref<{ label: string; value: number; ratio: number; img: string }[]>([]);
    const listData = ref<{ name: string; num: number; ratio: number }[]>([]);
    const xDataGas = ref<string[]>([]);
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
    const getGasUsage = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      };
      const res = await todayGasUsage(params);
      yData.value = res.map((item, index) => {
        return {
          label: item.name,
          value: item.num,
          ratio: item.ratio,
          img: getAssetsImage(imgList[index] ? imgList[index] : imgList[0]),
        };
      });
    };
    const getTemplateData = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trendTime.value.dateRange.join(","),
        type: trendTime.value.timeType,
      };
      listData.value = await todayGasUsageTop(params);
    };
    const getGasData = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: gasTime.value.dateRange.join(","),
        type: gasTime.value.timeType,
      };
      const res = await gasUsageTrend(params);
      xDataGas.value = res.xtitle;
      yDataGas.value.length = 0;
      titles.value.length = 0;

      for (const key in res.medicalGasDataVos) {
        const arr = [];
        for (let i = 0; i < res.xtitle.length; i++) {
          arr.push(0);
        }
        res.xtitle.forEach((x, index) => {
          res.medicalGasDataVos[key].forEach((item) => {
            if (x === item.timeFlag) {
              arr[index] = item.num;
            }
          });
        });
        titles.value.push(key);
        yDataGas.value.push({ name: key, data: arr });
      }
    };
    onMounted(() => {
      getGasUsage();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="今日气体使用概览" class="visiting-data">
            {yData.map((item) => (
              <div class="item" key={item.label}>
                <RoundDataPic img={item.img} />
                <a-statistic title={item.label}>
                  <template>
                    <count-to startVal={0} endVal={item.value} duration={2000} separator></count-to>
                    <span class="unit"> m³</span>
                    <div class="ringRatio">
                      <span> 环比</span>
                      <div class={["downtriangle", item.ratio > 0 && "uptriangle"]}></div>
                      <div class={[item.ratio > 0 ? "up" : "down"]}> {item.ratio.toFixed(2) + "%"}</div>
                    </div>
                  </template>
                </a-statistic>
              </div>
            ))}
          </SubPanelTemplate>
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
                <EventAlarmItem sort={index + 1} name={item.name} count={item.num} ratio={item.ratio + "%"} modes={"m³"} />
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
                titles={titles.value}
                gridTop="15"
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
