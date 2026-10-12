import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolLocationTop } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-point-ranking-top10.module.less";

const ROW_COLORS = ["#EF424A", "#FFAB10", "#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#655DD1", "#19F8F7", "#74AEE7", "#B9D9FF"];
const ROW_HEIGHT = 56;
const VISIBLE_ROWS = 5;

type RankItem = {
  name: string;
  value: number;
  percent: number;
  color: string;
};

export const PatrolPointRankingTop10 = defineComponent({
  name: "PatrolPointRankingTop10",
  setup() {
    const intercomTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const intercomRank = ref<RankItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const maxValue = computed(() => Math.max(...intercomRank.value.map((item) => item.value), 1));
    const shouldAutoScroll = computed(() => intercomRank.value.length > VISIBLE_ROWS);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const getIntercomEvent = async (): Promise<void> => {
      try {
        const res = await patrolLocationTop({ period: intercomTime.value.dateRange?.join(",") ?? "" });
        const rows = Array.isArray(res) ? res : [];
        const mapped = rows.slice(0, 10).map((item: { key?: string; value?: number }, index: number) => ({
          name: String(item.key || "--"),
          value: Number(item.value) || 0,
          percent: 0,
          color: ROW_COLORS[index % ROW_COLORS.length],
        }));
        const sum = mapped.reduce((acc, item) => acc + item.value, 0) || 1;
        intercomRank.value = mapped.map((item) => ({
          ...item,
          percent: Math.round((item.value / sum) * 1000) / 10,
        }));
      } catch {
        intercomRank.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getIntercomEvent();
    });

    const renderRows = (isZoom: boolean): JSX.Element[] =>
      intercomRank.value.map((item, index) => {
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
        ) : intercomRank.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : isZoom ? (
          <div class={[styles.listSurface, styles.isZoomList]}>{renderRows(true)}</div>
        ) : (
          <div class={styles.listSurface} style={{ height: `${viewportHeight.value}px` }}>
            <div class={styles.scrollViewport}>
              <Vue3SeamlessScroll list={intercomRank.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1000}>
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
          title="巡更点位排行榜Top10"
          class="visual-v2-sub-panel v2-panel-card patrol-point-ranking-top10-v2-panel"
          zoomable
          zoom-title="巡更点位排行榜Top10详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-patrol" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={intercomTime.value}
                  onUpdate:modelValue={(v) => {
                    intercomTime.value = v;
                  }}
                  onSearch={getIntercomEvent}
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

export default PatrolPointRankingTop10;
