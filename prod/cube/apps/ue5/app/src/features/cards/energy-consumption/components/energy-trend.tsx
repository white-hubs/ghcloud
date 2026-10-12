import moment from "moment";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import { applyEnergyTrendSeriesStyle } from "../utils/energy-trend-chart-style";
import EnergyTrendModal from "./energy-trend-modal";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { dcStatTrend } from "@/infrastructure/api/energy";
import { mapEnergyTrendLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./energy-trend.module.less";

const titleIcon = getThemeImage("comprehensive-energy-consumption.png");

const buildBuiltinRange = (timeType: string): string[] => {
  const fmt = "YYYY-MM-DD HH:mm:ss";
  if (timeType === "TODAY") {
    return [moment().format("YYYY-MM-DD 00:00:00"), moment().format(fmt)];
  }
  if (timeType === "THIS_WEEK") {
    return [moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"), moment().endOf("week").add(1, "days").format(fmt)];
  }
  if (timeType === "THIS_YEAR") {
    return [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(fmt)];
  }
  return [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("month").format(fmt)];
};

export const EnergyTrend = defineComponent({
  name: "EnergyTrend",
  props: {
    title: { type: String, required: true, default: "综合能耗趋势图" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const show = ref(false);
    // 对齐 legacy：默认本月；预填 dateRange，避免首屏 period 为空
    const timeFrame = ref<ModelValueItf>({
      timeType: "THIS_MONTH",
      dateRange: buildBuiltinRange("THIS_MONTH"),
    });
    const deviceFailureTrendCharData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(120, 252, 252, 0.85)", "rgba(120, 252, 252, 0.08)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });

    const syncTrendSeriesStyle = (): void => {
      applyEnergyTrendSeriesStyle(deviceFailureTrendCharData.yData[0], currentTheme.value);
    };

    watch(currentTheme, syncTrendSeriesStyle, { immediate: true });

    const resolvePeriod = (): string => {
      const range = timeFrame.value.dateRange;
      if (range?.[0] && range?.[1]) return `${range[0]},${range[1]}`;
      const fallback = buildBuiltinRange(timeFrame.value.timeType || "THIS_MONTH");
      return `${fallback[0]},${fallback[1]}`;
    };

    /** 对齐 legacy：dcStatTrend({ type, period }) */
    const getAlarmLevel = async (): Promise<void> => {
      try {
        const res = await dcStatTrend({
          type: timeFrame.value.timeType || "THIS_MONTH",
          period: resolvePeriod(),
        });
        const rows = Array.isArray(res) ? res : [];
        deviceFailureTrendCharData.xData = mapEnergyTrendLabels(
          rows.map((item: { time: string | number }) => item.time),
          timeFrame.value.timeType,
        );
        deviceFailureTrendCharData.yData[0].data = rows.map((item: { zhValue: number }) => Number(item.zhValue) || 0);
        syncTrendSeriesStyle();
      } catch {
        deviceFailureTrendCharData.xData = [];
        deviceFailureTrendCharData.yData[0].data = [];
      }
    };

    const handleAll = (): void => {
      show.value = true;
    };

    const close = (): void => {
      show.value = false;
    };

    onMounted(() => {
      void getAlarmLevel();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["energy-v2-chart-panel", isZoom ? "is-zoom" : ""]}>
          <LineChart
            x-data={deviceFailureTrendCharData.xData}
            series={deviceFailureTrendCharData.yData}
            showLegend={false}
            grid-top={isZoom ? "28" : "30"}
            grid-left="8"
            grid-right="4"
            grid-bottom={isZoom ? "18" : "22"}
            visible-count={isZoom ? 8 : 5}
            unit={{ x: "", y: "tce" }}
            height={isZoom ? 450 : undefined}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-trend-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme energy-v2-panel energy-trend-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="access-control-header-toolbar energy-v2-filter-group" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = {
                      timeType: v.timeType,
                      dateRange: v.dateRange?.length ? v.dateRange : buildBuiltinRange(v.timeType || "THIS_MONTH"),
                    };
                  }}
                  onSearch={getAlarmLevel}
                />
                <button
                  type="button"
                  class="energy-v2-more-link"
                  onPointerdown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAll();
                  }}
                >
                  更多
                </button>
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <EnergyTrendModal showModal={show.value} onClose={close} />
      </div>
    );
  },
});

export default EnergyTrend;
