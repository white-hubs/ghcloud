import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getConsumableVisualizationReduceRecord } from "@/infrastructure/api/property";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./_shared/asset-management-v2-shared.module.less";

import styles from "./trend-consumables-outbound.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card asset-management-v2-panel asset-management-card-theme access-control-card-theme";
const LINE_COLOR = "#2989FF";

export const TrendConsumablesOutbound = defineComponent({
  name: "TrendConsumablesOutbound",
  setup() {
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);

    const getTemplateData = async (): Promise<void> => {
      try {
        const res = await getConsumableVisualizationReduceRecord({ period: trendTime.value.dateRange.join(",") });
        const rows = Array.isArray(res) ? res : [];
        xData.value = rows.map((e: { name?: string }) => String(e.name ?? ""));
        yData.value = rows.map((e: { value?: number }) => Number(e.value) || 0);
      } catch {
        xData.value = [];
        yData.value = [];
      }
    };

    onMounted(() => {
      void getTemplateData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          "asset-management-card-body",
          isZoom ? ["asset-management-v2-panel", "asset-management-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <div class={[styles.chartSurface, "asset-management-chart-surface"]}>
          <LineChart
            x-data={xData.value}
            series={[
              {
                name: "出库",
                data: yData.value,
                smooth: true,
                symbolSize: 5,
                showSymbol: false,
                lineColor: LINE_COLOR,
                linearGradientColor: ["rgba(41, 137, 255, 0.42)", "rgba(41, 137, 255, 0)"],
              },
            ]}
            colors={[LINE_COLOR]}
            showLegend={false}
            gridTop="28"
            gridLeft="4"
            gridRight="4"
            gridBottom="10"
            unit={{ x: "", y: "次" }}
            axisPointer
            height={isZoom ? 360 : 198}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="asset-management-v2-root v2-panel-root">
        <SubPanelTemplate
          title="耗材出库趋势"
          class={PANEL_CLASS}
          zoomable
          zoom-title="耗材出库趋势详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-outbound" />,
            extra: () => (
              <div class="asset-management-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={trendTime.value}
                  onUpdate:modelValue={(v) => {
                    trendTime.value = v;
                  }}
                  onSearch={getTemplateData}
                />
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

export default TrendConsumablesOutbound;
