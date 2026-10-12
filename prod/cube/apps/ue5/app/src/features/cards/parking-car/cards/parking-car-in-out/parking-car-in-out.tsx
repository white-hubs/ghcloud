import { defineComponent, onMounted, reactive, ref } from "vue";

import StackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./parking-car-in-out.module.less";

const vehicleEntryIcon = getThemeImage("vehicle-entry.png");
const vehicleExitIcon = getThemeImage("vehicle-exit.png");
const vehicleTrendIcon = getThemeImage("vehicle-trend.png");

const chartColors = ["#2989FF", "#26C2BC"];

export const ParkingCarInOut = defineComponent({
  name: "ParkingCarInOut",
  setup() {
    const loading = ref(false);

    const timeType = ref({
      timeType: "TODAY",
      dateRange: [] as string[],
    });

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
            { offset: 0, color: "rgba(41, 137, 255, 1)" },
            { offset: 1, color: "rgba(41, 137, 255, 0.20)" },
          ],
        },
        {
          data: [] as number[],
          name: "驶出",
          colors: [
            { offset: 0, color: "rgba(38, 194, 188, 1)" },
            { offset: 1, color: "rgba(38, 194, 188, 0.08)" },
          ],
        },
      ],
    });

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const params = {
          type: timeType.value.timeType,
          period: timeType.value.dateRange.join(","),
        };
        const result = await Promise.all([
          cubeParkingLotService.getParkingAccessTotal(params),
          cubeParkingLotService.getParkingAccessTrend(params),
        ]);

        trafficList[0].value = Number(result[0]?.inNum ?? 0);
        trafficList[1].value = Number(result[0]?.outNum ?? 0);
        lineData.xData = (result[1]?.inTrendVOS ?? []).map((e: any) => e.period);
        lineData.yData[0].data = (result[1]?.inTrendVOS ?? []).map((e: any) => Number(e.num));
        lineData.yData[1].data = (result[1]?.outTrendVOS ?? []).map((e: any) => Number(e.num));
      } catch {
        // keep previous data on failure
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", "parking-in-out-body", isZoom ? "parking-in-out-v2-panel is-zoom" : ""]} data-no-zoom>
        {loading.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : (
          <>
            <div class="stats-row">
              {trafficList.map((item) => (
                <div class={["stat-card", item.cardClass]} key={`${isZoom ? "zoom-" : ""}${item.color}`}>
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
              <StackedLine
                title={lineData.title}
                yData={lineData.yData}
                xData={lineData.xData}
                color={chartColors}
                gridTop={isZoom ? 42 : 38}
                scrollable={false}
                visibleCount={lineData.xData.length || 6}
              />
            </div>
          </>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root parking-in-out-v2-root">
        <SubPanelTemplate
          title="车流趋势"
          class="visual-v2-sub-panel v2-panel-card parking-in-out-v2-panel"
          zoomable
          zoom-title="车流趋势详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={vehicleTrendIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm v-model:modelValue={timeType.value} onSearch={getData} />
              </div>
            ),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarInOut;
