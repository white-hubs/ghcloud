import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticstrend } from "@/infrastructure/api/saftsecurity/index";
import { mapTrendPeriodLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./security-alarm-trend.module.less";

const alarmSituationsIcon = getThemeImage("alarm-trend.png");

export const SecurityAlarmTrend = defineComponent({
  name: "SecurityAlarmTrend",
  props: {
    title: { type: String, default: "报警趋势" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const timeTypeqs = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });

    const gasChartData = reactive({
      xData: [] as string[],
      yData: [
        {
          name: "报警数",
          data: [] as number[],
          linearGradientColor: ["#6194F7", "#6194F7"],
          lineColor: "#6194F7",
        },
      ],
    });

    const timeDateqs = async (): Promise<void> => {
      try {
        const data = await statisticstrend({
          areaId: globalState.business.currentAreaId,
          period: timeTypeqs.value.dateRange?.join(",") ?? "",
          sceneType: globalState.business.currentMenu,
          type: timeTypeqs.value.timeType,
        });
        const rows = Array.isArray(data) ? data : [];
        gasChartData.xData = mapTrendPeriodLabels(
          rows.map((res) => res.period),
          timeTypeqs.value.timeType,
        );
        gasChartData.yData[0].data = rows.map((res) => Number(res.alarmNum) || 0);
      } catch {
        gasChartData.xData = [];
        gasChartData.yData[0].data = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void timeDateqs();
    });

    const renderChartBody = (isZoom: boolean): JSX.Element => (
      <div class={["security-alarm-trend-v2", "security-alarm-trend-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class={["chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : (
            <LineChart
              x-data={gasChartData.xData}
              series={gasChartData.yData}
              showLegend={false}
              axisPointer={true}
              unit={{ x: "", y: "次" }}
              gridBottom="32"
              scrollable
              dataZoomSlider={false}
            />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root security-alarm-trend-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card security-alarm-trend-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={alarmSituationsIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <DateInlineForm
                modelValue={timeTypeqs.value}
                onUpdate:modelValue={(v) => {
                  timeTypeqs.value = v;
                }}
                onSearch={timeDateqs}
                data-no-zoom
              />
            ),
            default: () => renderChartBody(false),
            "zoom-content": () => renderChartBody(true),
          }}
        />
      </div>
    );
  },
});

export default SecurityAlarmTrend;
