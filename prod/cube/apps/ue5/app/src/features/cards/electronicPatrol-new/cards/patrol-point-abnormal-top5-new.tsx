import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TaskAbnormalTop } from "@/infrastructure/api/maintain";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-point-abnormal-top5-new.module.less";

const ROW_COLORS = ["#EF424A", "#FFAB10", "#2B7FFF", "#4DA6FF", "#00C2E0"];
const RANK_INDEX_CLASS = ["sort1", "sort2", "sort3", "sortMuted", "sortMuted"] as const;
/** 单行高度（含间距），需与 less 中 .rankItem + margin 一致 */
const ROW_HEIGHT = 60;
const VISIBLE_ROWS = 5;

type RankItem = {
  name: string;
  value: number;
  share: number;
  chainRatio: number;
  color: string;
};

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const PatrolPointAbnormalTop5New = defineComponent({
  name: "PatrolPointAbnormalTop5New",
  setup() {
    const alarmTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const areaAlarmRank = ref<RankItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const shouldAutoScroll = computed(() => areaAlarmRank.value.length > VISIBLE_ROWS);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const abnormalTop = async (): Promise<void> => {
      try {
        const data = await TaskAbnormalTop({
          period: alarmTime.value.dateRange?.join(",") ?? "",
          type: alarmTime.value.timeType,
        });
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.slice(0, 5).map((item: { locationName?: string; num?: number; chainRatio?: number }, index: number) => ({
          name: item.locationName || "--",
          value: toNumber(item.num),
          share: 0,
          chainRatio: toNumber(item.chainRatio),
          color: ROW_COLORS[index % ROW_COLORS.length],
        }));
        const sum = mapped.reduce((acc, item) => acc + item.value, 0) || 1;
        areaAlarmRank.value = mapped.map((item) => ({
          ...item,
          share: Math.round((item.value / sum) * 1000) / 10,
        }));
      } catch {
        areaAlarmRank.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void abnormalTop();
    });

    const renderRows = (isZoom: boolean): JSX.Element[] =>
      areaAlarmRank.value.map((item, index) => {
        const barWidth = Math.max(item.share, item.value > 0 ? 4 : 0);
        return (
          <div class={styles.rankItem} key={`${isZoom ? "zoom-" : "list-"}${item.name}-${index}`}>
            <span class={[styles.rankIndex, styles[RANK_INDEX_CLASS[index] ?? "sortMuted"]]}>{index + 1}</span>
            <div class={styles.rankMain}>
              <div class={styles.rankTop}>
                <span class={styles.rankName} title={item.name}>
                  {item.name}
                </span>
                <span class={styles.rankCount}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={1400} />
                  <em class={styles.rankUnit}>次</em>
                </span>
              </div>
              <span class={styles.rankBarTrack}>
                <span
                  class={styles.rankBarFill}
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                  }}
                />
              </span>
              <div class={styles.rankMeta}>
                <span class={styles.rankShare}>占比 {item.share}%</span>
                <span class={styles.rankTrend}>
                  <span class={styles.rankTrendLabel}>环比</span>
                  <span class={[styles.rankArrow, item.chainRatio > 0 ? styles.rankArrowUp : ""]} />
                  <span class={item.chainRatio > 0 ? styles.rankTrendUp : styles.rankTrendDown}>{item.chainRatio}%</span>
                </span>
              </div>
            </div>
          </div>
        );
      });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["patrol-point-abnormal-top5-new-v2-panel", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : areaAlarmRank.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : isZoom ? (
          <div class={[styles.listSurface, styles.isZoomList]}>{renderRows(true)}</div>
        ) : (
          <div class={styles.listSurface} style={{ height: `${viewportHeight.value}px` }}>
            <div class={styles.scrollViewport}>
              <Vue3SeamlessScroll list={areaAlarmRank.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1000}>
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
          title="巡更点异常Top5"
          class="visual-v2-sub-panel v2-panel-card patrol-point-abnormal-top5-new-v2-panel"
          zoomable
          zoom-title="巡更点异常Top5详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-alarm" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTime.value = v;
                  }}
                  onSearch={abnormalTop}
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

export default PatrolPointAbnormalTop5New;
