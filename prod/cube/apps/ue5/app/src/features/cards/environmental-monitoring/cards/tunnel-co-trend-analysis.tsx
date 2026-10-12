import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { concentrationTunnels, environmentalIndicators } from "@/infrastructure/api/securitymanagement";
import LineChart from "@/shared-ui/panel/lineChart";
import traffic from "@/shared-ui/panel/traffic";

import styles from "./tunnel-co-trend-analysis.module.less";

export const TunnelCoTrendAnalysis = defineComponent({
  name: "TunnelCoTrendAnalysis",
  setup(_props, ctx) {
    const faultList = reactive([
      {
        color: "#2989FF",
        label: "最高值",
        value: "ppm",
      },
      {
        color: "#FFAB10",
        label: "实时平均",
        value: "20ppm",
      },
    ]);
    const titles = ref<string[]>(["入口段", "出口段", "基本段"]);
    const xData = ref<string[]>([]);
    const yData = ref<
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
        name: "入口段",
        data: [],
        linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
      },
      {
        name: "基本段",
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
      {
        name: "出口段",
        data: [],
        linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
      },
    ]);

    const getTemplateData = async () => {
      const res = await concentrationTunnels();
      xData.value = res.xtitle.map((item) => {
        return item + "时";
      });
      yData.value[0].data = res.xtitle.map((xItem) => {
        return res.inletSection.find((item) => item.timeFlag === xItem)
          ? res.inletSection.find((item) => item.timeFlag === xItem).fieldData
          : 0;
      });
      yData.value[1].data = res.xtitle.map((xItem) => {
        return res.basicSegment.find((item) => item.timeFlag === xItem)
          ? res.basicSegment.find((item) => item.timeFlag === xItem).fieldData
          : 0;
      });
      yData.value[2].data = res.xtitle.map((xItem) => {
        return res.exitSection.find((item) => item.timeFlag === xItem)
          ? res.exitSection.find((item) => item.timeFlag === xItem).fieldData
          : 0;
      });
    };
    const getEnvironmentalIndicators = async () => {
      const res = await environmentalIndicators();
      faultList[0].value = (res.coMax || 0) + "ppm";
      faultList[1].value = (res.co || 0) + "ppm";
    };

    onMounted(() => {
      getEnvironmentalIndicators();
      getTemplateData();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="隧道CO浓度趋势分析">
          <div class="flex-between">
            {faultList.map((item) => (
              <traffic key={item.color} trafficInfo={item}></traffic>
            ))}
          </div>
          <div class="chart">
            {" "}
            <LineChart
              x-data={xData.value}
              series={yData.value}
              showLegend={true}
              showBackground={true}
              titles={titles.value}
              gridTop="15"
              unit={{ x: "", y: "" }}
              axisPointer={true}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TunnelCoTrendAnalysis;
