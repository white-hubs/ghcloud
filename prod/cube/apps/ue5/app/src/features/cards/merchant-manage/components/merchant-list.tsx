import { computed, defineComponent, onMounted, ref, type PropType, provide } from "vue";

import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import { companiesPage } from "@/infrastructure/api/merchant";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "../cards/merchant-v2-shared.module.less";

import styles from "./merchant-list.module.less";

const CARD_VISIBLE_ROWS = 5;
const ZOOM_VISIBLE_ROWS = 9;
const CARD_ROW_HEIGHT = 44;
const ZOOM_ROW_HEIGHT = 52;
const MAX_CARD_ROWS = 100;

interface MerchantSpace {
  id?: string | number;
  bimId?: string;
  code?: string;
  name?: string;
  [key: string]: unknown;
}

interface MerchantRow {
  id?: string | number;
  name?: string;
  companyName?: string;
  spaces?: MerchantSpace[];
  [key: string]: unknown;
}

export const MerchantList = defineComponent({
  name: "MerchantList",
  props: {
    zoom: { type: Boolean as PropType<boolean>, default: false },
  },
  setup(props) {
    const merchantList = ref<MerchantRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const displayList = computed(() => merchantList.value.slice(0, MAX_CARD_ROWS));
    const rowHeight = computed(() => (props.zoom ? ZOOM_ROW_HEIGHT : CARD_ROW_HEIGHT));
    const visibleRows = computed(() => (props.zoom ? ZOOM_VISIBLE_ROWS : CARD_VISIBLE_ROWS));
    const shouldAutoScroll = computed(() => displayList.value.length > visibleRows.value);
    const viewportHeight = computed(() => visibleRows.value * rowHeight.value);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.4 : 0));

    const getData = async (): Promise<void> => {
      try {
        const res = await companiesPage({
          pageSize: MAX_CARD_ROWS,
          pageNum: 1,
          sort: "sendTime,desc",
          orderby: "sendTime,desc",
          search: "",
        });
        merchantList.value = Array.isArray(res?.records) ? res.records.slice(0, MAX_CARD_ROWS) : [];
      } catch {
        merchantList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const renderRow = (item: MerchantRow, index: number): JSX.Element => {
      const spaces = Array.isArray(item.spaces) ? item.spaces : [];
      const name = item.name || item.companyName || "--";
      return (
        <div class={styles.listRow} key={`${item.id || name}-${index}`}>
          <span class={styles.nameCell} title={name}>
            <span class={styles.nameDot} aria-hidden="true" />
            <span class={styles.nameText}>{name}</span>
          </span>
          <span class={styles.countCell}>
            <span class={styles.countValue}>{spaces.length}</span>
            <span class={styles.countUnit}>个</span>
          </span>
        </div>
      );
    };

    onMounted(() => {
      void getData();
    });

    return (): JSX.Element => (
      <div class={[styles.listSurface, props.zoom ? styles.isZoom : "", props.zoom ? "merchant-list-zoom" : ""]}>
        <div class={styles.tablePanel}>
          <div class={styles.listHead}>
            <span>名称</span>
            <span>档位数</span>
          </div>
          {!loaded.value ? (
            <PanelCardLoading zoom={props.zoom} />
          ) : displayList.value.length > 0 ? (
            <div class={styles.listViewport} style={{ height: `${viewportHeight.value}px` }}>
              {shouldAutoScroll.value ? (
                <Vue3SeamlessScroll list={displayList.value} step={scrollStep.value} hover singleHeight={rowHeight.value} waitTime={1000}>
                  {displayList.value.map((item, index) => renderRow(item, index))}
                </Vue3SeamlessScroll>
              ) : (
                displayList.value.map((item, index) => renderRow(item, index))
              )}
            </div>
          ) : (
            <div class={[styles.empty, props.zoom ? styles.isZoomEmpty : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default MerchantList;
