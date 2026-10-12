import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getPropertyByDepHistogram } from "@/infrastructure/api/property";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./_shared/asset-management-v2-shared.module.less";

import styles from "./distribution-departmental-assets.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card asset-management-v2-panel asset-management-card-theme access-control-card-theme";

export const DistributionDepartmentalAssets = defineComponent({
  name: "DistributionDepartmentalAssets",
  setup() {
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const barData = reactive({
      xData: [] as string[],
      yData: [] as Array<{ data: number[]; color?: string[] }>,
    });

    const getTemplateData = async (): Promise<void> => {
      try {
        const res = await getPropertyByDepHistogram({ period: trendTime.value.dateRange.join(",") });
        barData.xData = Array.isArray(res?.xdata) ? res.xdata : [];
        barData.yData = (Array.isArray(res?.series) ? res.series : []).map((e: { value?: number[] }) => ({
          data: Array.isArray(e.value) ? e.value.map((v) => Number(v) || 0) : [],
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        }));
      } catch {
        barData.xData = [];
        barData.yData = [];
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
          <OverviewChartBar title="个" gridTop={28} xData={barData.xData} yData={barData.yData} scrollable={isZoom} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="asset-management-v2-root v2-panel-root">
        <SubPanelTemplate
          title="部门资产分布情况"
          class={PANEL_CLASS}
          zoomable
          zoom-title="部门资产分布情况详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-department" />,
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

export default DistributionDepartmentalAssets;
