import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { leakStat } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-point-missed-statistics.module.less";

const ROW_COLORS = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#FFAB10", "#EF424A"];

/** 单行固定高度（含间距），需与 less 中 .rankItem 一致 */
const ROW_HEIGHT = 56;
/** 可视行数：超过该条数自动滚动 */
const VISIBLE_ROWS = 5;

type MissedRow = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const PatrolPointMissedStatistics = defineComponent({
  name: "PatrolPointMissedStatistics",
  setup() {
    const hiddenDangerTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const missedList = ref<MissedRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const maxValue = computed(() => Math.max(...missedList.value.map((item) => item.value), 1));
    const shouldAutoScroll = computed(() => missedList.value.length > VISIBLE_ROWS);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const changeHandleHiddenDangerTime = async (): Promise<void> => {
      try {
        const res = await leakStat({ period: hiddenDangerTime.value.dateRange?.join(",") ?? "" });
        const rows = Array.isArray(res) ? res : [];
        const mapped = rows.map((item: { locationName?: string; omitNum?: number }, index: number) => ({
          name: String(item.locationName || "--"),
          value: Number(item.omitNum) || 0,
          color: ROW_COLORS[index % ROW_COLORS.length],
          percent: 0,
        }));
        const sum = mapped.reduce((acc, item) => acc + item.value, 0) || 1;
        missedList.value = mapped.map((item) => ({
          ...item,
          percent: Math.round((item.value / sum) * 1000) / 10,
        }));
      } catch {
        missedList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeHandleHiddenDangerTime();
    });

    const renderRows = (isZoom: boolean): JSX.Element[] =>
      missedList.value.map((item, index) => {
        const barWidth = Math.max((item.value / maxValue.value) * 100, item.value > 0 ? 4 : 0);
        return (
          <div class={styles.rankItem} key={`${isZoom ? "zoom-" : "list-"}${item.name}-${index}`}>
            <span class={styles.rankTop}>
              <span class={styles.rankLeft}>
                <span class={styles.rankIndex}>{index + 1}</span>
                <span class={styles.rankName} title={item.name}>
                  {item.name}
                </span>
              </span>
              <span class={styles.rankMeta}>
                <span class={styles.rankCount}>
                  {item.value}
                  <em class={styles.rankUnit}>次</em>
                </span>
                <span class={styles.rankShare}>占比 {item.percent}%</span>
              </span>
            </span>
            <span class={styles.rankBarTrack}>
              <span
                class={styles.rankBarFill}
                style={{
                  width: `${barWidth}%`,
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                }}
              />
            </span>
          </div>
        );
      });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : missedList.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : isZoom ? (
          <div class={[styles.listSurface, styles.isZoomList]}>{renderRows(true)}</div>
        ) : (
          <div class={styles.listSurface} style={{ height: `${viewportHeight.value}px` }}>
            <div class={styles.scrollViewport}>
              <Vue3SeamlessScroll list={missedList.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1000}>
                {renderRows(false)}
              </Vue3SeamlessScroll>
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更点漏巡点位统计"
          class="visual-v2-sub-panel v2-panel-card patrol-point-missed-v2-panel"
          zoomable
          zoom-title="巡更点漏巡点位统计详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-hidden-danger" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={hiddenDangerTime.value}
                  onUpdate:modelValue={(v) => {
                    hiddenDangerTime.value = v;
                  }}
                  onSearch={changeHandleHiddenDangerTime}
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

export default PatrolPointMissedStatistics;
