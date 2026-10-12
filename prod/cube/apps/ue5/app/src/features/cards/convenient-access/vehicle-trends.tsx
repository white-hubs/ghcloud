import { Spin } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";

import VehicleTrendsModal from "./vehicle-trends-modal";
import StackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { mapTrendPeriodLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { trafficFlowTrend } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

import "./vehicle-trends.module.less";

const vehicleEntryIcon = getThemeImage("vehicle-entry.png");
const vehicleExitIcon = getThemeImage("vehicle-exit.png");
const vehicleTrendIcon = getThemeImage("vehicle-trend.png");
const chartColors = ["#2989FF", "#26C2BC"];

export const VehicleTrends = defineComponent({
  name: "VehicleTrends",
  setup() {
    const timeType = ref<{ timeType: string; dateRange: string[] }>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const showModal = ref(false);
    const loading = ref(false);
    const vehicleParams = reactive<{ period: string[] }>({ period: [] });

    const trafficList = reactive([
      {
        color: "#2989FF",
        label: "驶入",
        value: 0,
        cardClass: "is-entry",
        iconSrc: vehicleEntryIcon,
        valueClass: "is-entry-value",
      },
      {
        color: "#26C2BC",
        label: "驶出",
        value: 0,
        cardClass: "is-exit",
        iconSrc: vehicleExitIcon,
        valueClass: "is-exit-value",
      },
    ]);

    const lineData = reactive({
      title: "辆",
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "驶入",
          colors: [
            { offset: 0, color: "rgba(41, 137, 255, 0.28)" },
            { offset: 1, color: "rgba(41, 137, 255, 0)" },
          ],
        },
        {
          data: [] as number[],
          name: "驶出",
          colors: [
            { offset: 0, color: "rgba(38, 194, 188, 0.24)" },
            { offset: 1, color: "rgba(38, 194, 188, 0)" },
          ],
        },
      ],
    });

    const handleAll = (): void => {
      vehicleParams.period = [...(timeType.value?.dateRange ?? [])];
      showModal.value = true;
    };

    const changeDate = async (): Promise<void> => {
      loading.value = true;
      try {
        const dimension = timeType.value?.timeType || "THIS_YEAR";
        const res = await trafficFlowTrend({ dimension });
        lineData.xData = mapTrendPeriodLabels(res?.xdata ?? [], dimension);
        trafficList[0].value = Number(res?.series?.[0]?.total) || 0;
        trafficList[1].value = Number(res?.series?.[1]?.total) || 0;
        lineData.yData[0].data = Array.isArray(res?.series?.[0]?.value) ? res.series[0].value : [];
        lineData.yData[1].data = Array.isArray(res?.series?.[1]?.value) ? res.series[1].value : [];
      } catch {
        lineData.xData = [];
        trafficList[0].value = 0;
        trafficList[1].value = 0;
        lineData.yData[0].data = [];
        lineData.yData[1].data = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void changeDate();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (loading.value) {
        return (
          <div class={["panel-loading", isZoom ? "is-zoom" : ""]} data-no-zoom>
            <Spin size="large" tip="数据加载中..." />
          </div>
        );
      }

      return (
        <div class={["vehicle-trends-v2", "vehicle-trends-v2-panel", isZoom ? "is-zoom" : ""]}>
          <div class="stats-row" data-no-zoom>
            {trafficList.map((item) => (
              <div class={["stat-card", item.cardClass]} key={`${isZoom ? "zoom-" : ""}${item.color}`}>
                <div class="stat-icon stat-icon-image">
                  <img src={item.iconSrc} alt="" class="stat-icon-img" />
                </div>
                <div class="stat-content">
                  <div class="stat-label">{item.label}</div>
                  <div class="stat-value-row">
                    <div class={["stat-value", item.valueClass]}>{item.value}</div>
                    <span class="stat-unit">辆</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div class={["chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
            <StackedLine
              title={lineData.title}
              yData={lineData.yData}
              xData={lineData.xData}
              color={chartColors}
              gridTop={isZoom ? 42 : 38}
              zoomAnchor="start"
              scrollable={false}
              dataZoomSlider={false}
              visibleCount={lineData.xData.length || 6}
            />
          </div>
        </div>
      );
    };

    return () => (
      <div class="vehicle-trends-v2-root">
        <SubPanelTemplate
          title="车流趋势"
          class="visual-v2-sub-panel vehicle-trends-v2-panel"
          zoomable
          zoom-title="车流趋势详情"
          zoom-width={960}
          v-slots={{
            titleIcon: () => <img src={vehicleTrendIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm v-model:modelValue={timeType.value} onSearch={changeDate} />
                <span class="toolbar-divider" aria-hidden="true" />
                <button type="button" class="toolbar-more" onClick={handleAll}>
                  更多
                </button>
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        {showModal.value ? (
          <VehicleTrendsModal
            params={vehicleParams}
            showModal={showModal.value}
            onClose={() => {
              showModal.value = false;
            }}
          />
        ) : null}
      </div>
    );
  },
});

export default VehicleTrends;
