import moment from "moment";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { arrangeTodayStat } from "@/infrastructure/api/attendance";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import styles from "./duty-personnel.module.less";

const totalIcon = getThemeImage("device-total.png");
const onDutyIcon = getThemeImage("device-total-online.png");
const leaveIcon = getThemeImage("device-total-offline.png");

/** 单行固定高度（含间距），需与 less 中 .personCard 一致 */
const ROW_HEIGHT = 74;
/** 可视行数：超过该条数自动滚动 */
const VISIBLE_ROWS = 3;

type DutyRow = {
  staffId: string;
  staffName: string;
  mobile: string;
  className: string;
  timeRange: string;
  avatarText: string;
};

const buildListSignature = (list: DutyRow[]): string =>
  list.map((item) => `${item.staffId}|${item.staffName}|${item.mobile}|${item.className}|${item.timeRange}`).join(";");

export const DutyPersonnel = defineComponent({
  name: "DutyPersonnel",
  setup() {
    const personStatistic = reactive({
      total: 0,
      onDutyNum: 0,
      leaveNum: 0,
    });
    const personnelList = ref<DutyRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    let timer: ReturnType<typeof setInterval> | null = null;
    let lastListSignature = "";

    const shouldAutoScroll = computed(() => personnelList.value.length > VISIBLE_ROWS);
    const scrollStep = computed(() => (shouldAutoScroll.value ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const mapDutyRows = (records: any[]): DutyRow[] =>
      (Array.isArray(records) ? records : []).map((item: any, index: number) => {
        const name = String(item.staffName || "--");
        const start = item.startWorkTime ? moment(item.startWorkTime).format("DD日HH:mm") : "";
        const end = item.endWorkTime ? moment(item.endWorkTime).format("DD日HH:mm") : "";
        return {
          staffId: String(item.staffId || index),
          staffName: name,
          mobile: String(item.mobile || "--"),
          className: String(item.className || "无班次"),
          timeRange: start && end ? `${start}-${end}` : "",
          avatarText: name.slice(0, 1),
        };
      });

    const loadDutyData = async (): Promise<void> => {
      try {
        const res = await arrangeTodayStat();
        personStatistic.total = Number(res?.totalCount) || 0;
        personStatistic.onDutyNum = Number(res?.workCount) || 0;
        personStatistic.leaveNum = Math.max(personStatistic.total - personStatistic.onDutyNum, 0);

        const nextList = mapDutyRows(res?.staffResultList);
        const nextSignature = buildListSignature(nextList);
        // 轮询时若列表内容未变，不替换数组，避免无缝滚动被反复重置
        if (nextSignature !== lastListSignature) {
          lastListSignature = nextSignature;
          personnelList.value = nextList;
        }
      } catch {
        personStatistic.total = 0;
        personStatistic.onDutyNum = 0;
        personStatistic.leaveNum = 0;
        lastListSignature = "";
        personnelList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void loadDutyData();
      timer = setInterval(
        () => {
          void loadDutyData();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderPersonRows = (isZoom: boolean): JSX.Element[] =>
      personnelList.value.map((item, index) => (
        <div class={styles.personCard} key={`${isZoom ? "zoom-" : "list-"}${item.staffId}-${item.mobile}-${index}`}>
          <span class={styles.avatar} aria-hidden="true">
            {item.avatarText}
          </span>
          <span class={styles.personMeta}>
            <span class={styles.personTop}>
              <span class={styles.personName} title={item.staffName}>
                {item.staffName}
              </span>
              <span class={styles.personPhone}>{item.mobile}</span>
            </span>
            <span class={styles.personDuty} title={item.timeRange ? `${item.className}（${item.timeRange}）` : item.className}>
              <span class={styles.dutyLabel}>班次</span>
              <span class={styles.dutyValue}>
                {item.className}
                {item.timeRange ? `（${item.timeRange}）` : ""}
              </span>
            </span>
          </span>
          <span class={styles.statusBadge}>在岗</span>
        </div>
      ));

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <div class={[styles.statCard, styles.isTotal]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={totalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>人员总数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={personStatistic.total} separator="" duration={1400} />
              </span>
            </span>
          </div>
          <div class={[styles.statCard, styles.isOnDuty]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={onDutyIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>在岗人员</span>
              <span class={[styles.statValue, styles.isOnDutyValue]}>
                <CountTo startVal={0} endVal={personStatistic.onDutyNum} separator="" duration={1400} />
              </span>
            </span>
          </div>
          <div class={[styles.statCard, styles.isLeave]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={leaveIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>离岗人员</span>
              <span class={[styles.statValue, styles.isLeaveValue]}>
                <CountTo startVal={0} endVal={personStatistic.leaveNum} separator="" duration={1400} />
              </span>
            </span>
          </div>
        </div>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : personnelList.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : isZoom ? (
          <div class={[styles.listSurface, styles.isZoomList]}>
            <div class={styles.personList}>{renderPersonRows(true)}</div>
          </div>
        ) : (
          <div class={styles.listSurface} style={{ height: `${viewportHeight.value}px` }}>
            <div class={styles.scrollViewport}>
              <Vue3SeamlessScroll list={personnelList.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1000}>
                {renderPersonRows(false)}
              </Vue3SeamlessScroll>
            </div>
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="当日值班人员"
          class="visual-v2-sub-panel v2-panel-card cmd-duty-personnel-v2-panel"
          zoomable
          zoom-title="当日值班人员详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-personnel" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default DutyPersonnel;
