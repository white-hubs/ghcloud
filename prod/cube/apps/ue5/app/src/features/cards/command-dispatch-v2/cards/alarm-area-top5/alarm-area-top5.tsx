import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, provide, watch } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsAreaTop } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./alarm-area-top5.module.less";

const titleIcon = getThemeImage("regional-pedestrian-flow-ranking.png");
const RANK_COLORS = ["#f14545", "#ffab10", "#2f8dff", "#74aee7", "#5b9ce2"];
const VISIBLE_ROWS = 5;
const MIN_VISIBLE_ROWS = 3;

type RankItem = {
  id?: string;
  name?: string;
  alarmNum?: number;
  ratio?: number;
  chainRatio?: number;
};

export const AlarmAreaTop5 = defineComponent({
  name: "AlarmAreaTop5",
  setup() {
    const { globalState } = useStateStore();
    const handleTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    const alarmRank = reactive<{ list: RankItem[] }>({ list: [] });
    const loaded = ref(false);
    const cardBodyRef = ref<HTMLElement | null>(null);
    const visibleRows = ref(VISIBLE_ROWS);
    provide(panelCardLoadedKey, loaded);
    let requestSeq = 0;
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;

    const displayList = computed(() => alarmRank.list.slice(0, VISIBLE_ROWS));

    const updateVisibleRows = (): void => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        const body = cardBodyRef.value;
        const row = body?.querySelector<HTMLElement>(`.${styles.rankItem}`);
        const list = body?.querySelector<HTMLElement>(`.${styles.listSurface}`);
        if (!body || !row || !list) return;
        const rowHeight = row.getBoundingClientRect().height;
        const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
        if (rowHeight <= 0) return;
        const rows = Math.floor((body.clientHeight + gap) / (rowHeight + gap));
        visibleRows.value = Math.min(VISIBLE_ROWS, Math.max(MIN_VISIBLE_ROWS, rows));
      });
    };

    const getAlarmHandlTop = async (): Promise<void> => {
      const seq = ++requestSeq;
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value?.dateRange?.join(",") ?? "",
        type: handleTime.value?.timeType,
      };
      try {
        const res = await statisticsAreaTop(params);
        if (seq !== requestSeq) return;
        alarmRank.list = Array.isArray(res) ? res : [];
      } catch {
        if (seq !== requestSeq) return;
        alarmRank.list = [];
      } finally {
        if (seq === requestSeq) loaded.value = true;
      }
    };

    onMounted(() => {
      void getAlarmHandlTop();
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(updateVisibleRows);
        if (cardBodyRef.value) resizeObserver.observe(cardBodyRef.value);
      }
    });
    watch(
      () => [loaded.value, alarmRank.list.length],
      () => {
        void nextTick(updateVisibleRows);
      },
    );
    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
    });

    const clampPercent = (value: number): number => Math.max(0, Math.min(Number(value) || 0, 100));

    const renderRows = (isZoom: boolean): JSX.Element[] =>
      (isZoom ? alarmRank.list : displayList.value).map((item, index) => {
        const count = Number(item.alarmNum) || 0;
        const ratio = clampPercent(Number(item.ratio) || 0);
        const chain = Number(item.chainRatio) || 0;
        const accent = RANK_COLORS[Math.min(index, RANK_COLORS.length - 1)];
        const sortClass = index === 0 ? styles.sort1 : index === 1 ? styles.sort2 : index === 2 ? styles.sort3 : styles.sortMuted;
        return (
          <div class={styles.rankItem} key={item.id ?? `${item.name}-${index}`}>
            <span class={[styles.sort, sortClass]} aria-hidden="true">
              {index + 1}
            </span>
            <div class={styles.rankMain}>
              <div class={styles.rankTop}>
                <span class={styles.rankName} title={item.name || "--"}>
                  {item.name || "--"}
                </span>
                <span class={styles.rankValue}>
                  {count}
                  <em class={styles.rankUnit}>个</em>
                </span>
              </div>
              <span class={styles.rankBarTrack}>
                <span
                  class={styles.rankBarFill}
                  style={{
                    width: `${Math.max(ratio, count > 0 ? 4 : 0)}%`,
                    background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
                  }}
                />
              </span>
              <div class={styles.rankMeta}>
                <span class={styles.rankShare}>占比 {ratio}%</span>
                <span class={styles.rankTrend}>
                  <span class={styles.rankTrendLabel}>环比</span>
                  <span class={[styles.rankArrow, chain > 0 ? styles.rankArrowUp : ""]} />
                  <span class={chain > 0 ? styles.rankTrendUp : styles.rankTrendDown}>{chain}%</span>
                </span>
              </div>
            </div>
          </div>
        );
      });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        ref={isZoom ? undefined : cardBodyRef}
        class={[styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body"]}
        data-no-zoom
        style={isZoom ? undefined : ({ "--top5-visible-rows": String(visibleRows.value) } as Record<string, string>)}
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : alarmRank.list.length === 0 ? (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.listSurface, isZoom ? styles.isZoomList : ""]}>{renderRows(isZoom)}</div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="报警区域TOP5"
          class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel cmd-alarm-area-top5-v2-panel"
          zoomable
          zoom-title="报警区域TOP5详情"
          zoom-width={800}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="air-conditioning-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={handleTime.value}
                  onUpdate:modelValue={(v) => {
                    handleTime.value = v;
                  }}
                  onSearch={getAlarmHandlTop}
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

export default AlarmAreaTop5;
