import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getPalnStatus } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./patrol-plan.module.less";

const runningIcon = getThemeImage("device-total-online.png");
const stoppedIcon = getThemeImage("device-total-offline.png");
const endedIcon = getThemeImage("device-total.png");

type PlanItem = {
  name: string;
  code: string;
  value: number;
  color: string;
  percent: number;
};

const PLAN_META = [
  { name: "执行中", code: "ENABLE", color: "#328BF7", icon: runningIcon, tone: "isRunning" },
  { name: "已停用", code: "STOP", color: "#FFC700", icon: stoppedIcon, tone: "isStopped" },
  { name: "已结束", code: "END", color: "#EF424A", icon: endedIcon, tone: "isEnded" },
] as const;

export const PatrolPlan = defineComponent({
  name: "PatrolPlan",
  setup() {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const planItems = ref<PlanItem[]>(
      PLAN_META.map((item) => ({
        name: item.name,
        code: item.code,
        value: 0,
        color: item.color,
        percent: 0,
      })),
    );

    const total = computed(() => planItems.value.reduce((sum, item) => sum + item.value, 0));
    const hasStructure = computed(() => planItems.value.length > 0);

    const loadPlanStatus = async (): Promise<void> => {
      try {
        const res = await getPalnStatus();
        const rows = Array.isArray(res) ? res : [];
        const next = PLAN_META.map((meta) => {
          const matched = rows.find((row: { name?: string; value?: number }) => row?.name === meta.code);
          return {
            name: meta.name,
            code: meta.code,
            value: Number(matched?.value) || 0,
            color: meta.color,
            percent: 0,
          };
        });
        const sum = next.reduce((acc, item) => acc + item.value, 0) || 1;
        planItems.value = next.map((item) => ({
          ...item,
          percent: Math.round((item.value / sum) * 1000) / 10,
        }));
      } catch {
        planItems.value = PLAN_META.map((item) => ({
          name: item.name,
          code: item.code,
          value: 0,
          color: item.color,
          percent: 0,
        }));
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void loadPlanStatus();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          {PLAN_META.map((meta, index) => {
            const item = planItems.value[index];
            return (
              <div class={[styles.statCard, styles[meta.tone]]} key={meta.code}>
                <span class={styles.statIcon} aria-hidden="true">
                  <img src={meta.icon} alt="" />
                </span>
                <span class={styles.statContent}>
                  <span class={styles.statLabel}>{meta.name}</span>
                  <span class={styles.statValue}>
                    <CountTo startVal={0} endVal={item?.value ?? 0} separator="" duration={1400} />
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasStructure.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.chartSurface}>
            <div class={styles.pieWrap}>
              <ElevatorAnalysisPie pieData={planItems.value.map((item) => ({ name: item.name, value: item.value, color: item.color }))}>
                <div class={styles.pieCenter}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
                  </div>
                  <div class={styles.pieCenterLabel}>计划总数</div>
                </div>
              </ElevatorAnalysisPie>
            </div>
            <div class={styles.levelList}>
              {planItems.value.map((item) => (
                <div class={styles.levelItem} key={item.code}>
                  <span class={styles.levelTop}>
                    <span class={styles.levelName}>{item.name}</span>
                    <span class={styles.levelCount}>{item.value}</span>
                  </span>
                  <span class={styles.levelBarRow}>
                    <span class={styles.levelColor} style={{ background: item.color }} />
                    <span class={styles.levelBarTrack}>
                      <span
                        class={styles.levelBarFill}
                        style={{
                          width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                        }}
                      />
                    </span>
                  </span>
                  <span class={styles.levelShare}>占比 {item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更计划"
          class="visual-v2-sub-panel v2-panel-card patrol-plan-v2-panel"
          zoomable
          zoom-title="巡更计划详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-management" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default PatrolPlan;
