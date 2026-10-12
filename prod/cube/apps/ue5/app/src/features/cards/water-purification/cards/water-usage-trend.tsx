import { computed, defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { usageStatByTypeAndTime } from "@/infrastructure/api/securitymanagement";
import { mapTrendPeriodLabels } from "@/infrastructure/utils/chart-axis-style";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./water-usage-trend.module.less";

const titleIcon = getThemeImage("alarm-trend.png");

type SeriesItem = {
  name: string;
  data: number[];
  linearGradientColor?: string[];
  lineColor?: string;
  showSymbol?: boolean;
  smooth?: boolean;
  symbolSize?: number;
};

export const WaterUsageTrend = defineComponent({
  name: "WaterUsageTrend",
  setup() {
    const gasTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const xDataGas = ref<string[]>([]);
    const titles = ref<string[]>([]);
    const yDataGas = ref<SeriesItem[]>([]);
    const hasData = computed(() => xDataGas.value.length > 0 && yDataGas.value.some((series) => series.data.length > 0));

    const getGasData = async (): Promise<void> => {
      const params = {
        period: gasTime.value.dateRange.join(","),
        type: gasTime.value.timeType,
      };
      try {
        const res = await usageStatByTypeAndTime(params);
        yDataGas.value = [];
        const rawPeriods = res?.[0]?.list?.map((item: { dateHour: string }) => item.dateHour) ?? [];
        xDataGas.value = mapTrendPeriodLabels(rawPeriods, gasTime.value.timeType);
        titles.value = (res ?? []).map((item: { waterTypeName: string }) => item.waterTypeName);
        (res ?? []).forEach((item: { waterTypeName: string; list: Array<{ totalUsage: number }> }) => {
          yDataGas.value.push({
            name: item.waterTypeName,
            data: item.list.map((row) => row.totalUsage),
          });
        });
      } catch {
        xDataGas.value = [];
        titles.value = [];
        yDataGas.value = [];
      }
    };

    onMounted(() => {
      void getGasData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["water-usage-trend-v2", isZoom ? "is-zoom" : ""]}>
        <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasData.value ? (
            <LineChart
              x-data={xDataGas.value}
              series={yDataGas.value}
              showLegend={true}
              showBackground={true}
              titles={titles.value}
              gridTop={isZoom ? "16" : "12"}
              gridBottom={isZoom ? "10" : "8"}
              axisPointer={true}
              height={isZoom ? 450 : undefined}
              visibleCount={6}
              scrollable
              dataZoomSlider={false}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root water-usage-trend-v2-root">
        <SubPanelTemplate
          title="净水使用趋势"
          class="visual-v2-sub-panel v2-panel-card water-usage-trend-v2-panel"
          zoomable
          zoom-title="净水使用趋势详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={gasTime.value}
                  onUpdate:modelValue={(v) => {
                    gasTime.value = v;
                  }}
                  onSearch={getGasData}
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

export default WaterUsageTrend;
