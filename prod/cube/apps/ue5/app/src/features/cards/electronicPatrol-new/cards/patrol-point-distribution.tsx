import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { electronArea } from "@/infrastructure/api/maintain";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./patrol-point-distribution.module.less";

const COLORS = ["#29C2FF", "#74AEE7", "#FFC700", "#19F8F7", "#655DD1", "#EF424A"];
/** 单行固定高度（含间距），需与 less 中 .levelItem 一致 */
const ROW_HEIGHT = 36;
/** 右侧可视行数：超过该条数自动滚动 */
const VISIBLE_ROWS = 4;

type AreaItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
  areaId?: string;
};

export const PatrolPointDistribution = defineComponent({
  name: "PatrolPointDistribution",
  setup() {
    const total = ref(0);
    const pieData = ref<AreaItem[]>([]);
    const listData = ref<AreaItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasData = computed(() => listData.value.length > 0);
    const shouldAutoScroll = computed(() => listData.value.length > VISIBLE_ROWS);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const changePatrol = async (): Promise<void> => {
      try {
        const res = await electronArea({});
        total.value = Number(res?.total) || 0;
        const rows = Array.isArray(res?.locationAreaList) ? [...res.locationAreaList] : [];
        rows.sort((a: { num?: number }, b: { num?: number }) => (Number(b.num) || 0) - (Number(a.num) || 0));

        const fullList: AreaItem[] = rows.map((item: { areaId?: string; areaName?: string; num?: number }, index: number) => ({
          areaId: item.areaId,
          name: item.areaName || "--",
          value: Number(item.num) || 0,
          color: COLORS[index % COLORS.length],
          percent: 0,
        }));
        const listSum = fullList.reduce((acc, item) => acc + item.value, 0) || 1;
        listData.value = fullList.map((item) => ({
          ...item,
          percent: Math.round((item.value / listSum) * 1000) / 10,
        }));

        const top: AreaItem[] = [];
        let other = 0;
        fullList.forEach((item, index) => {
          if (index <= 2) {
            top.push({ ...item });
          } else {
            other += item.value;
          }
        });
        if (fullList.length > 3) {
          top.push({
            name: "其他",
            value: other,
            color: COLORS[3],
            percent: 0,
          });
        }
        const pieSum = top.reduce((acc, item) => acc + item.value, 0) || 1;
        pieData.value = top.map((item) => ({
          ...item,
          percent: Math.round((item.value / pieSum) * 1000) / 10,
        }));
      } catch {
        total.value = 0;
        pieData.value = [];
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changePatrol();
    });

    const renderListRows = (isZoom: boolean): JSX.Element[] =>
      listData.value.map((item, index) => (
        <div class={styles.levelItem} key={`${isZoom ? "zoom-" : "list-"}${item.areaId ?? item.name}-${index}`}>
          <span class={styles.levelNameWrap}>
            <span class={styles.levelSwatch} style={{ background: item.color, color: item.color }} />
            <span class={styles.levelName} title={item.name}>
              {item.name}
            </span>
          </span>
          <span class={styles.levelCount} style={{ color: item.color }}>
            {item.value}
            <em class={styles.levelUnit}>个</em>
          </span>
        </div>
      ));

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["patrol-point-distribution-v2-panel", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.chartSurface}>
            <div class={styles.pieWrap}>
              <ElevatorAnalysisPie pieData={pieData.value}>
                <div class={styles.pieCenter}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
                    <em class={styles.pieCenterUnit}>个</em>
                  </div>
                  <div class={styles.pieCenterLabel}>总量</div>
                </div>
              </ElevatorAnalysisPie>
            </div>
            {isZoom ? (
              <div class={[styles.levelList, styles.isZoomList]}>{renderListRows(true)}</div>
            ) : shouldAutoScroll.value ? (
              <div class={[styles.levelList, styles.isScrollList]} style={{ height: `${viewportHeight.value}px` }}>
                <div class={styles.scrollViewport}>
                  <Vue3SeamlessScroll list={listData.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1000}>
                    {renderListRows(false)}
                  </Vue3SeamlessScroll>
                </div>
              </div>
            ) : (
              <div class={[styles.levelList, styles.isFillList]}>{renderListRows(false)}</div>
            )}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更点分布情况"
          class="visual-v2-sub-panel v2-panel-card patrol-point-distribution-v2-panel"
          zoomable
          zoom-title="巡更点分布情况详情"
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

export default PatrolPointDistribution;
