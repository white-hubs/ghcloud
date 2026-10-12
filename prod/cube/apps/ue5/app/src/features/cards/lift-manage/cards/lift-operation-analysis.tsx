import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";

import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { operationsAnalysisData } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/universal-panel/_shared/universal-panel-v2-shared.less";

import styles from "./lift-operation-analysis.module.less";

const defaultXAxis = ["4", "8", "12", "16", "20", "24"];
const runTotalIcon = getThemeImage("alarm-count.png");

export const LiftOperationAnalysis = defineComponent({
  name: "LiftOperationAnalysis",
  setup() {
    const { globalState } = useStateStore();
    const operationsAnalysisTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [""],
    });
    const barData = reactive({
      xData: [...defaultXAxis],
      yData: [
        {
          data: defaultXAxis.map(() => 0),
          name: "运行次数",
          color: ["rgba(41, 137, 255, 0.92)", "rgba(41, 137, 255, 0.12)"],
        },
      ],
    });

    const runTotal = computed(() => barData.yData[0].data.reduce((sum, value) => sum + (Number(value) || 0), 0));

    const loadData = async (): Promise<void> => {
      try {
        const params = {
          type: operationsAnalysisTime.value.timeType,
          period: operationsAnalysisTime.value.dateRange?.join(",") ?? "",
        };
        const res: any = await operationsAnalysisData(params);
        const xData = Array.isArray(res?.xtitle) && res.xtitle.length > 0 ? res.xtitle.map(String) : defaultXAxis;
        const operations = Array.isArray(res?.operationsAnalysis) ? res.operationsAnalysis : [];
        barData.xData = xData;
        barData.yData[0].data = xData.map((xItem: string) => {
          const hit = operations.find((item: any) => String(item?.timeFlag) === xItem);
          return Number(hit?.dataValue) || 0;
        });
      } catch {
        barData.xData = [...defaultXAxis];
        barData.yData[0].data = defaultXAxis.map(() => 0);
      }
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void loadData();
      },
    );

    onMounted(() => {
      void loadData();
    });

    const renderDateForm = (): JSX.Element => (
      <div class={styles.headerToolbar} data-no-zoom>
        <DateInlineForm
          modelValue={operationsAnalysisTime.value}
          onUpdate:modelValue={(value) => {
            operationsAnalysisTime.value = value;
          }}
          onSearch={loadData}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : "", ...(isZoom ? universalPanelZoomClass : [])]} data-no-zoom>
        <div class={styles.summaryCard}>
          <div class={styles.summaryGlyph} aria-hidden="true">
            <img src={runTotalIcon} alt="" />
          </div>
          <div class={styles.summaryContent}>
            <span class={styles.summaryLabel}>运行总次数</span>
            <span class={styles.summaryValueRow}>
              <span class={styles.summaryValue}>
                <CountTo startVal={0} endVal={runTotal.value} separator="" duration={1400} />
              </span>
              <span class={styles.summaryUnit}>次</span>
            </span>
          </div>
        </div>
        <div class={styles.chartSurface}>
          <OverviewChartBar
            title="次"
            xData={barData.xData}
            yData={barData.yData}
            x-font-size={10.5}
            height={isZoom ? 320 : 168}
            gridTop={isZoom ? 40 : 34}
            bottom="12%"
            scrollable={false}
          />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="运行分析"
          class={`${UNIVERSAL_PANEL_V2_CLASS} lift-operation-analysis-v2-panel`}
          zoomable
          zoom-title="运行分析详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="trend" />,
            extra: () => renderDateForm(),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default LiftOperationAnalysis;
