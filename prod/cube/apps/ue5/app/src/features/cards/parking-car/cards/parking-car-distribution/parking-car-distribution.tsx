import { Skeleton } from "ant-design-vue";
import * as echarts from "echarts";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import { parkingStore } from "../../store/parking";
import { useParkArea } from "@/features/cards/parking-car/hooks/use-park-area";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import { calcFontSize } from "@/infrastructure/utils/common";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { ProgressBar } from "@/shared-ui/panel/progress-bar/progress-bar";

import "./parking-car-distribution.module.less";

const numberOfParkingLotsIcon = getThemeImage("number-of-parking-lots.png");
const numberOfParkingSpacesIcon = getThemeImage("number-of-parking-spaces.png");
const parkingIotDistributionIcon = getThemeImage("parking-iot-distribution.png");

use([PieChart, TitleComponent, TooltipComponent]);

const PIE_COLORS = ["#328BF7", "#FFC700", "#19F8F7", "#655DD1", "#EF424A"];

interface DistributionItem {
  label: string;
  value: number;
  totalNum?: number;
  originalName?: string;
  name?: string;
  [key: string]: unknown;
}

export const ParkingCarDistribution = defineComponent({
  name: "ParkingCarDistribution",
  setup() {
    const store = parkingStore();
    const { showParkArea } = useParkArea();

    const staticData = ref([
      { name: "车场数", value: 0, unit: "个", iconSrc: numberOfParkingLotsIcon },
      { name: "车位数", value: 0, unit: "个", iconSrc: numberOfParkingSpacesIcon },
    ]);

    let chartInstance: echarts.ECharts | null = null;
    let zoomChartInstance: echarts.ECharts | null = null;
    const list = ref<DistributionItem[]>([]);
    const loading = ref(false);

    const legendItems = computed(() => {
      const total = staticData.value[1].value;
      return list.value.map((item, index) => ({
        ...item,
        color: PIE_COLORS[index % PIE_COLORS.length],
        percent: total > 0 ? ((item.value / total) * 100).toFixed(0) : "0",
      }));
    });

    const getPieData = () =>
      list.value.map((item, index) => ({
        ...item,
        itemStyle: { color: PIE_COLORS[index % PIE_COLORS.length] },
      }));

    const updateChart = (instance: echarts.ECharts | null, isZoom = false): void => {
      if (!instance) return;
      const chartTheme = getVisualThemeChartColors();
      const total = staticData.value[1].value;
      const option = {
        color: PIE_COLORS,
        tooltip: {
          trigger: "item",
          formatter: (params: any): string =>
            `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>
              <span>${params.data.originalName}</span>
            </div>
            车位数量：${params.value}个<br/>占比：${total > 0 ? ((params.value / total) * 100).toFixed(0) : 0}%`,
          backgroundColor: chartTheme.tooltipBg,
          borderColor: chartTheme.tooltipBorder,
          textStyle: { color: chartTheme.tooltipText, fontSize: calcFontSize(12) },
        },
        legend: { show: false },
        series: [
          {
            name: "车场分布",
            type: "pie",
            radius: isZoom ? ["62%", "82%"] : ["58%", "78%"],
            center: ["50%", "50%"],
            label: { show: false },
            labelLine: { show: false },
            avoidLabelOverlap: true,
            data: getPieData(),
          },
        ],
      };
      instance.setOption(option, true);
    };

    const updateCharts = (): void => {
      updateChart(chartInstance);
      updateChart(zoomChartInstance, true);
    };

    const resizeChart = (instance: echarts.ECharts, isZoom = false): void => {
      nextTick(() => {
        instance.resize();
        updateChart(instance, isZoom);
        requestAnimationFrame(() => {
          instance.resize();
          updateChart(instance, isZoom);
        });
      });
    };

    const getData = async (): Promise<void> => {
      try {
        const params = { source: "SELF_BUILT" };
        loading.value = true;
        const result = await Promise.all([cubeParkingLotService.getParkingInfo(params), cubeParkingLotService.getParkingLotList(params)]);
        list.value = (result[1] ?? [])
          .map((item: any, index: number) => ({
            ...item,
            label: item?.areaName || item?.name || "--",
            value: item?.totalNum ?? 0,
            originalName: item?.areaName || item?.name,
            name: `${item?.areaName || item?.name}_${index}`,
          }))
          ?.sort((a, b) => b.value - a.value);
        staticData.value[0].value = list.value?.length ?? 0;
        staticData.value[1].value = result[0]?.totalNum ?? 0;
      } catch {
        // ignore
      } finally {
        loading.value = false;
      }
    };

    const handleLegendClick = (item: DistributionItem): void => {
      store.updateCurrentParking(item);
      showParkArea();
    };

    const bindChart = (el: Element | null, isZoom = false): void => {
      if (!(el instanceof HTMLElement)) return;
      const currentInstance = isZoom ? zoomChartInstance : chartInstance;
      if (currentInstance?.getDom() === el) {
        resizeChart(currentInstance, isZoom);
        return;
      }
      currentInstance?.dispose();
      const nextInstance = echarts.init(el);
      nextInstance.on("click", (params: any) => {
        store.updateCurrentParking(params);
        showParkArea();
      });
      if (isZoom) {
        zoomChartInstance = nextInstance;
      } else {
        chartInstance = nextInstance;
      }
      resizeChart(nextInstance, isZoom);
    };

    const handleResize = (): void => {
      chartInstance?.resize();
      zoomChartInstance?.resize();
    };

    const handleThemeChange = (): void => {
      updateCharts();
    };

    onMounted(() => {
      getData().then(() => {
        nextTick(() => updateCharts());
      });
      window.addEventListener("resize", handleResize);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, handleThemeChange);
    });

    onUnmounted(() => {
      chartInstance?.dispose();
      zoomChartInstance?.dispose();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, handleThemeChange);
    });

    watch(list, () => {
      nextTick(() => updateCharts());
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <Skeleton loading={loading.value} active>
        <div class={["distribution-v2", "parking-car-distribution-v2-panel", isZoom ? "is-zoom" : ""]}>
          <div class={["static-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
            {staticData.value.map((item) => (
              <div class="metric-mini-card" key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                <div class="metric-mini-icon" aria-hidden="true">
                  <img src={item.iconSrc} alt="" class="metric-mini-icon-img" />
                </div>
                <div class="metric-mini-content">
                  <div class="metric-mini-label">{item.name}</div>
                  <div class="metric-mini-value-row">
                    <CountTo class="metric-mini-value v2-metric-value" startVal={0} endVal={item.value} separator="" duration={2000} />
                    <span class="metric-mini-unit">{item.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div class={["distribution-chart-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
            {list.value.length === 0 ? (
              <NoData class="chart-empty" />
            ) : (
              <>
                <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
                  <div ref={(el) => bindChart(el as Element | null, isZoom)} class="chart-canvas" />
                  <div class="chart-center-overlay">
                    <div class="center-label">车场数</div>
                    <div class="center-value v2-metric-value">{staticData.value[0].value}个</div>
                  </div>
                </div>
                <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
                  {legendItems.value.map((item) => (
                    <div class="legend-item" key={`${isZoom ? "zoom-legend-" : ""}${item.name}`} onClick={() => handleLegendClick(item)}>
                      <div class="legend-left">
                        <span class="legend-color" style={{ background: item.color }} />
                        <span class="legend-name" title={item.originalName}>
                          {item.originalName}
                        </span>
                      </div>
                      <span class="legend-percent">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {list.value.length > 0 && (
            <div class={["progress-list", isZoom ? "is-zoom" : ""]} data-no-zoom>
              {list.value.map((item) => (
                <div class="progress-item" key={`${isZoom ? "zoom-" : ""}${item.label}`}>
                  <ProgressBar
                    detailMode="share"
                    valueLabel="车位数"
                    totalLabel="总车位"
                    showTotalDetail={false}
                    total={staticData.value[1].value}
                    label={item.label}
                    value={item.value}
                    unit="个"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Skeleton>
    );

    return () => (
      <div class="parking-car-distribution-v2-root v2-panel-root">
        <SubPanelTemplate
          title="车场分布"
          class="visual-v2-sub-panel v2-panel-card parking-car-distribution-v2-panel"
          zoomable
          zoom-title="车场分布详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={parkingIotDistributionIcon} alt="" class="title-card-icon" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarDistribution;
