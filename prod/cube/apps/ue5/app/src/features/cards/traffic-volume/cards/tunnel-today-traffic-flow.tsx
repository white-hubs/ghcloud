import moment from "moment";
import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { trafficFlowTunnels } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import LineChart from "@/shared-ui/panel/lineChart";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./tunnel-today-traffic-flow.module.less";

const vehicleEntryIcon = getThemeImage("vehicle-entry.png");
const vehicleExitIcon = getThemeImage("vehicle-exit.png");
const vehicleTrendIcon = getThemeImage("vehicle-trend.png");

const chartColors = ["#2989FF", "#26C2BC"];

export const TunnelTodayTrafficFlow = defineComponent({
  name: "TunnelTodayTrafficFlow",
  setup() {
    const loading = ref(false);

    const trafficList = reactive([
      {
        label: "进入",
        value: 0,
        cardClass: "is-entry",
        iconSrc: vehicleEntryIcon,
        valueClass: "is-entry-value",
      },
      {
        label: "离开",
        value: 0,
        cardClass: "is-exit",
        iconSrc: vehicleExitIcon,
        valueClass: "is-exit-value",
      },
    ]);

    const xData = ref<string[]>([]);
    const yData = ref([
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

    const getTrafficFlowTunnels = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await trafficFlowTunnels({
          period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
        });
        trafficList[0].value = res.directionTotalIn;
        trafficList[1].value = res.directionTotalOut;
        xData.value = res.xtitle.map((item) => `${item}时`);
        yData.value[0].data = res.xtitle.map((xItem) => {
          return res.directionInList.find((item) => item.timeFlag === xItem)?.num ?? 0;
        });
        yData.value[1].data = res.xtitle.map((xItem) => {
          return res.directionOutList.find((item) => item.timeFlag === xItem)?.num ?? 0;
        });
      } catch {
        // keep previous data on failure
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void getTrafficFlowTunnels();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", "tunnel-today-body", isZoom ? "tunnel-today-v2-panel is-zoom" : ""]} data-no-zoom>
        {loading.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : (
          <>
            <div class="stats-row">
              {trafficList.map((item) => (
                <div class={["stat-card", item.cardClass]} key={`${isZoom ? "zoom-" : ""}${item.label}`}>
                  <div class="stat-icon stat-icon-image">
                    <img src={item.iconSrc} alt="" class="stat-icon-img" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-label">{item.label}</div>
                    <div class="stat-value-row">
                      <div class={["stat-value", "v2-metric-value", item.valueClass]}>{item.value}</div>
                      <span class="stat-unit">辆</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]}>
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                gridTop={isZoom ? "16" : "12"}
                gridBottom={isZoom ? "10" : "8"}
                unit={{ x: "", y: "辆" }}
                axisPointer={true}
                height={isZoom ? 430 : undefined}
                visibleCount={6}
                scrollable
                dataZoomSlider={false}
                colors={chartColors}
              />
            </div>
          </>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root tunnel-today-v2-root">
        <SubPanelTemplate
          title="隧道今日车流量分析"
          class="visual-v2-sub-panel v2-panel-card tunnel-today-v2-panel"
          zoomable
          zoom-title="隧道今日车流量分析详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={vehicleTrendIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TunnelTodayTrafficFlow;
