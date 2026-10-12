import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolTodayTimeFrame } from "@/infrastructure/api/door";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./today-patrol-time-distribution.module.less";

export const TodayPatrolTimeDistribution = defineComponent({
  name: "TodayPatrolTimeDistribution",
  setup() {
    const xData = ref<string[]>([]);
    const yDataTrend = ref<number[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const getPatrolTodayTimeFrame = async (): Promise<void> => {
      try {
        const res = await patrolTodayTimeFrame({ type: "TODAY" });
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
      void getPatrolTodayTimeFrame();
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
          title="今日巡更时段分布"
          class="visual-v2-sub-panel v2-panel-card today-patrol-time-distribution-v2-panel"
          zoomable
          zoom-title="今日巡更时段分布详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TodayPatrolTimeDistribution;
