import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { chargingTrends } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";

import "./parking-car-charge-trend.module.less";

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M4 18h16v2H4v-2Zm2.8-5.2 2.8 2.4L12 11.2l4.2 5.6 2.8-2.1L12 6.8 6.8 12.8Z" fill="currentColor" />
    </svg>
  </span>
);

export const ParkingCarChargeTrend = defineComponent({
  name: "ParkingCarChargeTrend",
  setup() {
    const trend = ref<{ timeType: string } | undefined>();
    const xData = reactive<{ arr: string[] }>({ arr: [] });
    const series = reactive<{
      arr: {
        name: string;
        data: number[];
        lineColor: string;
        linearGradientColor: string[];
        smooth: boolean;
        showSymbol: boolean;
        symbolSize: number;
      }[];
    }>({
      arr: [
        {
          name: "收费金额",
          data: [],
          lineColor: "#568EFF",
          linearGradientColor: ["rgba(86, 142, 255, 0.55)", "rgba(86, 142, 255, 0)"],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
        },
      ],
    });

    const chargingTrendsInfo = async (): Promise<void> => {
      if (!trend.value) {
        trend.value = { timeType: "day" };
      }
      const res = await chargingTrends({ dimension: trend.value.timeType });
      xData.arr = res.xdata ?? [];
      series.arr[0].data = (res.series?.[0]?.value ?? []).map((n: number) => Number(n) || 0);
    };

    onMounted(() => {
      void chargingTrendsInfo();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", "parking-charge-trend-v2-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]}>
          {xData.arr.length ? (
            <LineChart
              xData={xData.arr}
              series={series.arr}
              unit={{ x: "", y: "元" }}
              showLegend={false}
              gridTop={isZoom ? "30" : "28"}
              height={isZoom ? 380 : undefined}
              scrollable={false}
              visible-count={xData.arr.length || 6}
              x-axis-label-rotate-threshold={8}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root parking-charge-trend-v2-root">
        <SubPanelTemplate
          title="收费趋势"
          class="visual-v2-sub-panel v2-panel-card parking-charge-trend-v2-panel"
          zoomable
          zoom-title="收费趋势详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm v-model:modelValue={trend.value} onSearch={chargingTrendsInfo} />
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

export default ParkingCarChargeTrend;
