import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolLocationTrend } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-point-trend.module.less";

export const PatrolPointTrend = defineComponent({
  name: "PatrolPointTrend",
  setup() {
    const trendTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const xData = ref<string[]>([]);
    const yDataTrend = ref<number[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const getTrendEvent = async (): Promise<void> => {
      try {
        const res = await patrolLocationTrend({
          period: trendTime.value.dateRange?.join(",") ?? "",
          type: trendTime.value.timeType,
        });
        const rows = Array.isArray(res) ? res : [];
        xData.value = rows.map((item: { key?: string }) => String(item.key ?? "--"));
        yDataTrend.value = rows.map((item: { value?: number }) => Number(item.value) || 0);
      } catch {
        xData.value = [];
        yDataTrend.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getTrendEvent();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : xData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.chartSurface}>
            <LineChart
              unit={{ x: "", y: "次" }}
              gridTop={isZoom ? "28" : "26"}
              x-data={xData.value}
              series={[
                {
                  name: "巡更次数",
                  data: yDataTrend.value,
                  linearGradientColor: ["rgb(86, 142, 255)", "rgba(86, 142, 255, 0)"],
                },
              ]}
            />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更点位趋势图"
          class="visual-v2-sub-panel v2-panel-card patrol-point-trend-v2-panel"
          zoomable
          zoom-title="巡更点位趋势图详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={trendTime.value}
                  onUpdate:modelValue={(v) => {
                    trendTime.value = v;
                  }}
                  onSearch={getTrendEvent}
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

export default PatrolPointTrend;
