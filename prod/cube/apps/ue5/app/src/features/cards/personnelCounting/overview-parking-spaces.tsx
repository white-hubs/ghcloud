import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { parkingData } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./overview-parking-spaces.module.less";

const totalIcon = getThemeImage("vehicle-trend.png");

type MetricRow = {
  label: string;
  value: number;
  percent: number;
  tone: "used" | "free";
};

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M4 6h16v12H4V6Zm2 2v8h12V8H6Zm2 2h3v4H8v-4Zm5 0h3v4h-3v-4Z" fill="currentColor" />
    </svg>
  </span>
);

export const OverviewParkingSpaces = defineComponent({
  name: "OverviewParkingSpaces",
  setup() {
    const total = ref(0);
    const metrics = reactive<MetricRow[]>([
      { label: "使用车位", value: 0, percent: 0, tone: "used" },
      { label: "空闲车位", value: 0, percent: 0, tone: "free" },
    ]);

    const loadData = async (): Promise<void> => {
      try {
        const res = await parkingData();
        const lot = res?.parkingLotTotal || { total: 0, used: 0, empty: 0 };
        const nextTotal = Number(lot.total) || 0;
        const used = Number(lot.used) || 0;
        const empty = Number(lot.empty) || 0;
        const base = Math.max(nextTotal, 1);
        total.value = nextTotal;
        metrics[0].value = used;
        metrics[0].percent = Math.round((used / base) * 1000) / 10;
        metrics[1].value = empty;
        metrics[1].percent = Math.round((empty / base) * 1000) / 10;
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
            <span class={styles.summaryLabel}>车位总数</span>
            <span class={styles.summaryValueRow}>
              <span class={styles.summaryValue}>
                <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
              </span>
              <span class={styles.summaryUnit}>个</span>
            </span>
          </div>
        </div>

        <div class={styles.metricGrid}>
          {metrics.map((item) => (
            <div class={[styles.metricCard, styles[`tone-${item.tone}`]]} key={`${isZoom ? "zoom-" : ""}${item.label}`}>
              <div class={styles.metricHeader}>
                <span class={styles.metricDot} />
                <span class={styles.metricLabel}>{item.label}</span>
                <span class={styles.metricValue}>
                  {item.value}
                  <span class={styles.metricUnit}>个</span>
                </span>
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
          title="车位总览"
          class="visual-v2-sub-panel v2-panel-card overview-parking-spaces-v2-panel"
          zoomable
          zoom-title="车位总览详情"
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

export default OverviewParkingSpaces;
