import { computed, defineComponent, onMounted, ref, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { mapTrendPeriodLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./visitor-transit-trend.module.less";

const titleIcon = getThemeImage("alarm-trend.png");

export const VisitorTransitTrend = defineComponent({
  name: "VisitorTransitTrend",
  setup() {
    const trendPeriod = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasData = computed(() => xData.value.length > 0 && yData.value.some((v) => Number(v) > 0));

    const getListData = async (): Promise<void> => {
      try {
        const params = {
          period: trendPeriod.value.dateRange?.join(",") ?? "",
        };
        const result = await cubeVisitorManagementService.getVisitorPassTrend(params);
        const list = Array.isArray(result) ? result : [];
        const rawHours = list.map((item: { hourStr?: string }) => String(item.hourStr ?? ""));
        xData.value = mapTrendPeriodLabels(rawHours, trendPeriod.value.timeType || "TODAY");
        yData.value = list.map((item: { count?: number }) => Number(item.count) || 0);
      } catch {
        xData.value = [];
        yData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getListData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["visor-visitor-trend-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !hasData.value ? (
            <NoData />
          ) : (
            <LineChart
              x-data={xData.value}
              series={[
                {
                  name: "通行量",
                  data: yData.value,
                  linearGradientColor: ["rgba(41, 137, 255, 0.35)", "rgba(41, 137, 255, 0.02)"],
                  lineColor: "#2989FF",
                },
              ]}
              showLegend={false}
              showBackground
              axisPointer
              gridTop={isZoom ? "16" : "12"}
              gridBottom={isZoom ? "10" : "8"}
              height={isZoom ? 420 : undefined}
              visibleCount={6}
              scrollable
              dataZoomSlider={false}
            />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root visor-visitor-trend-v2-root">
        <SubPanelTemplate
          title="访客通行趋势"
          class="visual-v2-sub-panel v2-panel-card visor-visitor-trend-v2-panel"
          zoomable
          zoom-title="访客通行趋势详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={trendPeriod.value}
                  onUpdate:modelValue={(v) => {
                    trendPeriod.value = {
                      timeType: v?.timeType || "TODAY",
                      dateRange: [...(v?.dateRange ?? [])],
                    };
                  }}
                  onSearch={getListData}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default VisitorTransitTrend;
