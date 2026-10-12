import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getCarNum } from "@/infrastructure/api/park-management";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./entry-and-exit-records.module.less";

const totalIcon = getThemeImage("vehicle-trend.png");
const entryIcon = getThemeImage("vehicle-entry.png");
const exitIcon = getThemeImage("vehicle-exit.png");

type MetricRow = {
  label: string;
  value: number;
  percent: number;
  tone: "entry" | "exit";
  icon: string;
};

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path
        d="M4 17 9 12l3 3 7-8M15 7h4v4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
);

export const EntryAndExitRecords = defineComponent({
  name: "EntryAndExitRecords",
  setup() {
    const total = ref(0);
    const metrics = reactive<MetricRow[]>([
      { label: "今日入场", value: 0, percent: 0, tone: "entry", icon: entryIcon },
      { label: "今日出场", value: 0, percent: 0, tone: "exit", icon: exitIcon },
    ]);

    const loadData = async (): Promise<void> => {
      try {
        const res = await getCarNum();
        const inNum = Number(res?.inNum) || 0;
        const outNum = Number(res?.outNum) || 0;
        const nextTotal = inNum + outNum;
        const base = Math.max(nextTotal, 1);
        total.value = nextTotal;
        metrics[0].value = inNum;
        metrics[0].percent = Math.round((inNum / base) * 1000) / 10;
        metrics[1].value = outNum;
        metrics[1].percent = Math.round((outNum / base) * 1000) / 10;
      } catch {
        total.value = 0;
        metrics[0].value = 0;
        metrics[0].percent = 0;
        metrics[1].value = 0;
        metrics[1].percent = 0;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.summaryCard}>
          <div class={styles.summaryGlyph} aria-hidden="true">
            <img src={totalIcon} alt="" />
          </div>
          <div class={styles.summaryContent}>
            <span class={styles.summaryLabel}>出入车流总数</span>
            <span class={styles.summaryValueRow}>
              <span class={styles.summaryValue}>
                <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
              </span>
              <span class={styles.summaryUnit}>辆</span>
            </span>
          </div>
        </div>

        <div class={styles.metricGrid}>
          {metrics.map((item) => (
            <div class={[styles.metricCard, styles[`tone-${item.tone}`]]} key={`${isZoom ? "zoom-" : ""}${item.label}`}>
              <div class={styles.metricHeader}>
                <span class={styles.metricIcon} aria-hidden="true">
                  <img src={item.icon} alt="" />
                </span>
                <span class={styles.metricLabel}>{item.label}</span>
              </div>
              <div class={styles.metricValueRow}>
                <span class={styles.metricValue}>{item.value}</span>
                <span class={styles.metricUnit}>辆</span>
              </div>
              <div class={styles.metricTrack}>
                <span class={styles.metricFill} style={{ width: `${Math.max(0, Math.min(item.percent, 100))}%` }} />
              </div>
              <span class={styles.metricShare}>占比 {item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="出入统计"
          class="visual-v2-sub-panel v2-panel-card entry-exit-records-v2-panel"
          zoomable
          zoom-title="出入统计详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EntryAndExitRecords;
