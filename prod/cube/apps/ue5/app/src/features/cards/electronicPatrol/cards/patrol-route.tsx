import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { routeList } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./patrol-route.module.less";

/** 单行固定高度，需与 less 中 .tableRow 一致 */
const ROW_HEIGHT = 36;
/** 可视行数：超过该条数自动滚动 */
const VISIBLE_ROWS = 5;

type RouteRow = {
  patrolRouteName: string;
  patrolLocationNumber: number | string;
  key: string;
};

export const PatrolRoute = defineComponent({
  name: "PatrolRoute",
  setup() {
    const listData = ref<RouteRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const shouldAutoScroll = computed(() => listData.value.length > VISIBLE_ROWS);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const getPatrolRoute = async (): Promise<void> => {
      try {
        const res = await routeList();
        const rows = Array.isArray(res) ? res : [];
        listData.value = rows.map((item: { patrolRouteName?: string; patrolLocationNumber?: number | string }, index: number) => ({
          key: `${item.patrolRouteName ?? "route"}-${index}`,
          patrolRouteName: item.patrolRouteName || "--",
          patrolLocationNumber: item.patrolLocationNumber ?? 0,
        }));
      } catch {
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getPatrolRoute();
    });

    const renderRows = (isZoom: boolean): JSX.Element[] =>
      listData.value.map((item, index) => (
        <div class={styles.tableRow} key={`${isZoom ? "zoom-" : "list-"}${item.key}-${index}`}>
          <span class={styles.colName} title={item.patrolRouteName}>
            {item.patrolRouteName}
          </span>
          <span class={styles.colCount}>
            {item.patrolLocationNumber}
            <em class={styles.colUnit}>个</em>
          </span>
        </div>
      ));

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : listData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.tableSurface}>
            <div class={styles.tableHeader}>
              <span class={styles.colName}>巡更路线</span>
              <span class={styles.colCount}>巡更点数量</span>
            </div>
            {isZoom ? (
              <div class={[styles.listViewport, styles.isZoomList]}>{renderRows(true)}</div>
            ) : (
              <div class={styles.listViewport} style={{ height: `${viewportHeight.value}px` }}>
                <div class={styles.scrollViewport}>
                  <Vue3SeamlessScroll list={listData.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1000}>
                    {renderRows(false)}
                  </Vue3SeamlessScroll>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="巡更路线"
          class="visual-v2-sub-panel v2-panel-card patrol-route-v2-panel"
          zoomable
          zoom-title="巡更路线详情"
          zoom-width={720}
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

export default PatrolRoute;
