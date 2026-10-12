import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import ElevatorOperationTable from "./elevator-operation-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { operationsAnalysisData } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./elevator-analysis-panel.module.less";

const runTotalIcon = getThemeImage("alarm-count.png");

type BarSeries = {
  data: number[];
  name: string;
  color: string[];
};

export const ElevatorAnalysisPanel = defineComponent({
  name: "ElevatorAnalysisPanel",
  setup() {
    const operationsAnalysisTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const barData = reactive<{ xData: string[]; yData: BarSeries[] }>({
      xData: [],
      yData: [
        {
          data: [],
          name: "运行次数",
          color: ["rgba(41, 137, 255, 0.92)", "rgba(41, 137, 255, 0.18)"],
        },
      ],
    });
    const showModal = ref(false);
    const modalParameter = reactive({
      period: "",
      type: "THIS_YEAR",
    });

    const runTotal = computed(() => barData.yData[0]?.data?.reduce((sum, item) => sum + (Number(item) || 0), 0) || 0);

    const changeHandleOperationsAnalysis = async (): Promise<void> => {
      try {
        const params = {
          type: operationsAnalysisTime.value.timeType,
          period: operationsAnalysisTime.value.dateRange?.join(",") ?? "",
        };
        const res = await operationsAnalysisData(params);
        const titles = Array.isArray(res?.xtitle) ? res.xtitle : [];
        const rows = Array.isArray(res?.operationsAnalysis) ? res.operationsAnalysis : [];
        barData.xData = titles;
        barData.yData[0].data = titles.map((xItem: string) => {
          const hit = rows.find((item: { timeFlag?: string; dataValue?: number }) => item.timeFlag === xItem);
          return Number(hit?.dataValue) || 0;
        });
      } catch {
        barData.xData = [];
        barData.yData[0].data = [];
      }
    };

    const openOperationModal = (): void => {
      modalParameter.period = operationsAnalysisTime.value.dateRange?.join(",") ?? "";
      modalParameter.type = operationsAnalysisTime.value.timeType || "THIS_YEAR";
      showModal.value = true;
    };

    onMounted(() => {
      void changeHandleOperationsAnalysis();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={runTotalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>运行总次数</span>
              <span class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={runTotal.value} separator="" duration={1600} />
                </span>
                <span class={styles.statUnit}>次</span>
              </span>
            </span>
          </button>
        </div>
        <div class={[styles.chartSurface, isZoom ? styles.isZoomChart : ""]}>
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
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="电梯运行分析"
            class="visual-v2-sub-panel v2-panel-card elevator-analysis-panel-v2-panel"
            zoomable
            zoom-title="电梯运行分析详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="access-control-trend" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={operationsAnalysisTime.value}
                    onUpdate:modelValue={(v) => {
                      operationsAnalysisTime.value = v;
                    }}
                    onSearch={changeHandleOperationsAnalysis}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ElevatorOperationTable
          showModal={showModal.value}
          parameter={modalParameter}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </>
    );
  },
});

export default ElevatorAnalysisPanel;
