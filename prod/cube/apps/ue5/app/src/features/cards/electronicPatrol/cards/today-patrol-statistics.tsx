import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolTodayStatistics } from "@/infrastructure/api/door";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./today-patrol-statistics.module.less";

type StatItem = {
  label: string;
  value: number;
  unit: string;
  flag: "personNum" | "pointNum" | "elapsedTime";
  tone: "default" | "isAmber" | "isCyan";
};

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const TodayPatrolStatistics = defineComponent({
  name: "TodayPatrolStatistics",
  setup() {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const transactionList = ref<StatItem[]>([
      { label: "巡更人员", value: 0, unit: "名", flag: "personNum", tone: "default" },
      { label: "巡更点位", value: 0, unit: "个", flag: "pointNum", tone: "isCyan" },
      { label: "巡更实时耗时", value: 0, unit: "小时", flag: "elapsedTime", tone: "isAmber" },
    ]);

    const getPatrolTodayStatistics = async (): Promise<void> => {
      try {
        const res = await patrolTodayStatistics({ type: "TODAY" });
        transactionList.value = transactionList.value.map((item) => ({
          ...item,
          value: toNumber(res?.[item.flag]),
        }));
      } catch {
        transactionList.value = transactionList.value.map((item) => ({ ...item, value: 0 }));
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getPatrolTodayStatistics();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }

      return (
        <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
          <div class={styles.statsGrid}>
            {transactionList.value.map((item) => (
              <div class={[styles.statCard, item.tone === "default" ? "" : styles[item.tone]]} key={item.flag}>
                <span class={styles.statLabel}>{item.label}</span>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={1400} decimals={item.flag === "elapsedTime" ? 1 : 0} />
                  <em class={styles.statUnit}>{item.unit}</em>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="今日巡更统计"
          class="visual-v2-sub-panel v2-panel-card today-patrol-statistics-v2-panel"
          zoomable
          zoom-title="今日巡更统计详情"
          zoom-width={820}
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

export default TodayPatrolStatistics;
