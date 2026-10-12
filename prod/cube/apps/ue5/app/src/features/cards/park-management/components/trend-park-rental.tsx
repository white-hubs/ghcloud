import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { estateContractStatTrend } from "@/infrastructure/api/youxianqu-park";
import LineChart from "@/shared-ui/panel/lineChart";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../cards/park-management-v2-shared.module.less";
import "./trend-park-rental.module.less";

const SERIES_STYLE = {
  name: "物业管理",
  linearGradientColor: ["rgba(47, 141, 255, 0.5)", "rgba(47, 141, 255, 0.02)"],
  lineColor: "rgba(47, 141, 255, 0.85)",
};

const fallbackMonths = (): string[] => {
  const months = new Date().getMonth() + 1;
  return Array.from({ length: months }, (_, i) => `${i + 1}月`);
};

export const TrendParkRental = defineComponent({
  name: "TrendParkRental",
  props: {
    // 屏上标题多为「物业管理」；接口与 legacy 一致：固定本年、无时间切换
    title: { type: String, required: false, default: "物业管理" },
  },
  setup(props) {
    const xData = ref<string[]>(fallbackMonths());
    const series = ref([{ ...SERIES_STYLE, data: fallbackMonths().map(() => 0) }]);

    /** 对齐 legacy：estateContractStatTrend({ periodType: 'THIS_YEAR' })，无时间筛选 */
    const loadTrend = async (): Promise<void> => {
      try {
        const res = await estateContractStatTrend({ periodType: "THIS_YEAR" });
        const rows = Array.isArray(res) ? res : [];
        if (rows.length === 0) {
          const axis = fallbackMonths();
          xData.value = axis;
          series.value = [{ ...SERIES_STYLE, data: axis.map(() => 0) }];
          return;
        }
        xData.value = rows.map((e) => String(e?.trendX ?? ""));
        series.value = [{ ...SERIES_STYLE, data: rows.map((e) => Number(e?.trendY) || 0) }];
      } catch {
        const axis = fallbackMonths();
        xData.value = axis;
        series.value = [{ ...SERIES_STYLE, data: axis.map(() => 0) }];
      }
    };

    onMounted(() => {
      void loadTrend();
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
              unit={{ x: "", y: "份" }}
              height={isZoom ? 320 : 170}
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
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel trend-park-rental-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-outbound" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TrendParkRental;
