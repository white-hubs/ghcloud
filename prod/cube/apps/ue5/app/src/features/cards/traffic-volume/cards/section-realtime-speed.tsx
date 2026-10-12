import moment from "moment";
import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { speedAnalysis } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import LineChart from "@/shared-ui/panel/lineChart";

import "./section-realtime-speed.module.less";

const vehicleTrendIcon = getThemeImage("vehicle-trend.png");

const chartColors = ["#2989FF", "#26C2BC"];

export const SectionRealtimeSpeed = defineComponent({
  name: "SectionRealtimeSpeed",
  setup() {
    const xData = ref<string[]>([]);
    const yData = reactive([
      {
        data: [] as number[],
        name: "进入",
        linearGradientColor: ["rgba(41, 137, 255, 0.85)", "rgba(41, 137, 255, 0.08)"],
        lineColor: "#2989FF",
      },
      {
        data: [] as number[],
        name: "离开",
        linearGradientColor: ["rgba(38, 194, 188, 0.85)", "rgba(38, 194, 188, 0.08)"],
        lineColor: "#26C2BC",
      },
    ]);

    const getSpeedAnalysis = async (): Promise<void> => {
      const res = await speedAnalysis({
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      xData.value = res.xtitle.map((item) => `${item}时`);
      yData[0].data = res.xtitle.map((xItem) => {
        return res.realAverageSpeedAnalysisIn.find((item) => item.timeFlag === xItem)?.speed ?? 0;
      });
      yData[1].data = res.xtitle.map((xItem) => {
        return res.realAverageSpeedAnalysisOut.find((item) => item.timeFlag === xItem)?.speed ?? 0;
      });
    };

    onMounted(() => {
      void getSpeedAnalysis();
    });

    const renderChartBody = (isZoom: boolean): JSX.Element => (
      <div class={["section-speed-v2", "section-speed-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <LineChart
            x-data={xData.value}
            series={yData}
            showLegend={true}
            showBackground={true}
            gridTop={isZoom ? "16" : "12"}
            gridBottom={isZoom ? "10" : "8"}
            unit={{ x: "", y: "km/h" }}
            axisPointer={true}
            height={isZoom ? 450 : undefined}
            visibleCount={6}
            scrollable
            dataZoomSlider={false}
            colors={chartColors}
          />
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root section-speed-v2-root">
        <SubPanelTemplate
          title="断面实时平均车速分析"
          class="visual-v2-sub-panel v2-panel-card section-speed-v2-panel"
          zoomable
          zoom-title="断面实时平均车速分析详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={vehicleTrendIcon} alt="" class="title-icon-img" />,
            default: () => renderChartBody(false),
            "zoom-content": () => renderChartBody(true),
          }}
        />
      </div>
    );
  },
});

export default SectionRealtimeSpeed;
