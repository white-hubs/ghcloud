import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TaskRoute } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-route-new.module.less";

export const PatrolRouteNew = defineComponent({
  name: "PatrolRouteNew",
  setup() {
    const operationsAnalysisTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "巡更次数",
          color: ["rgba(41, 137, 255, 0.92)", "rgba(41, 137, 255, 0.12)"],
        },
      ],
    });
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const taskRouteData = async (): Promise<void> => {
      try {
        const data = await TaskRoute({
          type: operationsAnalysisTime.value.timeType,
          period: operationsAnalysisTime.value.dateRange?.join(",") ?? "",
        });
        const rows = Array.isArray(data) ? data : [];
        barData.xData = rows.map((item: { routeName?: string }) => item.routeName || "--");
        barData.yData[0].data = rows.map((item: { keepNum?: number }) => Number(item.keepNum) || 0);
      } catch {
        barData.xData = [];
        barData.yData[0].data = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void taskRouteData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : barData.xData.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.chartSurface}>
            <OverviewChartBar title="次" xData={barData.xData} yData={barData.yData} gridTop={28} height="100%" />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更路线"
          class="visual-v2-sub-panel v2-panel-card patrol-route-new-v2-panel"
          zoomable
          zoom-title="巡更路线详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={operationsAnalysisTime.value}
                  onUpdate:modelValue={(v) => {
                    operationsAnalysisTime.value = v;
                  }}
                  onSearch={taskRouteData}
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

export default PatrolRouteNew;
