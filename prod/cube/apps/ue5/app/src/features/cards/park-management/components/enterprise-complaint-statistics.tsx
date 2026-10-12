import moment from "moment";
import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { complaintStatTrend } from "@/infrastructure/api/youxianqu-park";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../cards/park-management-v2-shared.module.less";
import "./enterprise-complaint-statistics.module.less";

/** 对齐 legacy：本周 / 本月 / 今年 */
const TIME_LIST = [
  { label: "本周", value: "THIS_WEEK" },
  { label: "本月", value: "THIS_MONTH" },
  { label: "今年", value: "THIS_YEAR" },
];

const SERIES_STYLE = {
  name: "投诉建议",
  linearGradientColor: ["rgba(47, 141, 255, 0.5)", "rgba(47, 141, 255, 0.02)"],
  lineColor: "rgba(47, 141, 255, 0.85)",
};

const buildBuiltinRange = (timeType: string): string[] => {
  const fmt = "YYYY-MM-DD HH:mm:ss";
  if (timeType === "THIS_WEEK") {
    return [moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"), moment().endOf("week").add(1, "days").format(fmt)];
  }
  if (timeType === "THIS_MONTH") {
    return [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("month").format(fmt)];
  }
  return [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(fmt)];
};

export const EnterpriseComplaintStatistics = defineComponent({
  name: "EnterpriseComplaintStatistics",
  props: {
    title: { type: String, required: false, default: "企业投诉建议统计" },
  },
  setup(props) {
    // legacy 默认 THIS_YEAR；预填 dateRange 避免首屏空参
    const topTimeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: buildBuiltinRange("THIS_YEAR"),
    });
    const xData = ref<string[]>([]);
    const series = ref([{ ...SERIES_STYLE, data: [] as number[] }]);

    /** 对齐 legacy：complaintStatTrend({ periodType }) */
    const changeTopTimeFrame = async (): Promise<void> => {
      const periodType = topTimeFrame.value.timeType || "THIS_YEAR";
      try {
        const res = await complaintStatTrend({ periodType });
        const rows = Array.isArray(res) ? res : [];
        // legacy：直接 map trendX / trendY，空数组则空轴（不伪造占位）
        xData.value = rows.map((e) => String(e?.trendX ?? ""));
        series.value = [{ ...SERIES_STYLE, data: rows.map((e) => Number(e?.trendY) || 0) }];
      } catch {
        xData.value = [];
        series.value = [{ ...SERIES_STYLE, data: [] }];
      }
    };

    onMounted(() => {
      void changeTopTimeFrame();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="park-manage-chart-surface" data-no-zoom>
          <div class={["park-manage-chart", isZoom ? "is-zoom" : ""]}>
            <LineChart
              x-data={xData.value}
              series={series.value}
              showLegend={false}
              gridTop={isZoom ? "28" : "26"}
              gridBottom={isZoom ? "16" : "12"}
              unit={{ x: "", y: "次" }}
              height={isZoom ? 360 : 180}
              visibleCount={6}
              scrollable
              dataZoomSlider={false}
              axisPointer
            />
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel complaint-stat-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-work-order" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={TIME_LIST}
                  modelValue={topTimeFrame.value}
                  onUpdate:modelValue={(v: ModelValueItf) => {
                    topTimeFrame.value = {
                      timeType: v.timeType,
                      dateRange: v.dateRange?.length ? v.dateRange : buildBuiltinRange(v.timeType || "THIS_YEAR"),
                    };
                  }}
                  onSearch={changeTopTimeFrame}
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

export default EnterpriseComplaintStatistics;
