import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import SmallInspectTable from "../components/small-inspect-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { insTaskCountStat, insTaskStat } from "@/infrastructure/api/maintain";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./safety-inspection-statistics.module.less";

const taskTotalIcon = getThemeImage("alarm-count.png");
const taskPendingIcon = getThemeImage("alarm-count-unhandled.png");
const taskProgressIcon = getThemeImage("alarm-count-handled.png");

const VISIBLE_COUNT = 5;
/** 单行固定高度，需与 less 中 .rankItem 一致 */
const ITEM_HEIGHT = 68;

type RankItem = {
  name: string;
  id: string;
  number: number;
  ratio: number;
  chainRatio: number;
};

export const SafetyInspectionStatistics = defineComponent({
  name: "SafetyInspectionStatistics",
  props: {
    title: {
      type: String,
      default: "安全巡检统计",
    },
  },
  setup(props) {
    const eventTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const inspectParameter = reactive({
      depId: "",
      status: "",
      period: "",
    });
    const inspectModalShow = ref(false);
    const switchList = ["任务数", "完成数"] as const;
    const currentItem = ref<(typeof switchList)[number]>("任务数");
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const stats = reactive({
      total: 0,
      pending: 0,
      underway: 0,
    });
    const rankList = ref<RankItem[]>([]);

    const needScroll = computed(() => rankList.value.length > VISIBLE_COUNT);
    const viewportHeight = computed(() => ITEM_HEIGHT * VISIBLE_COUNT);

    const getInsCount = async (): Promise<void> => {
      const params = {
        begin: eventTime.value.dateRange?.[0],
        end: eventTime.value.dateRange?.[1],
      };
      const res = await insTaskCountStat(params);
      stats.total = Number(res?.inspectionTaskNum) || 0;
      stats.pending = Number(res?.waitAcceptNum) || 0;
      stats.underway = Number(res?.underwayTaskNum) || 0;
    };

    const getInsStat = async (): Promise<void> => {
      const params = {
        period: eventTime.value.dateRange?.join(",") ?? "",
        status: currentItem.value === "任务数" ? "" : "OVER",
      };
      const res = await insTaskStat(params);
      const rows = Array.isArray(res) ? res : [];
      const allCount = rows.reduce((pre: number, item: { taskNum?: number }) => pre + (Number(item.taskNum) || 0), 0) || 1;
      rankList.value = rows.map((item: { depName?: string; depId?: string; taskNum?: number; chainRatio?: number }) => {
        const number = Number(item.taskNum) || 0;
        return {
          name: item.depName || "--",
          id: String(item.depId ?? ""),
          number,
          ratio: Math.round((number / allCount) * 1000) / 10,
          chainRatio: Number(item.chainRatio) || 0,
        };
      });
    };

    const refresh = async (): Promise<void> => {
      try {
        await Promise.all([getInsCount(), getInsStat()]);
      } catch {
        stats.total = 0;
        stats.pending = 0;
        stats.underway = 0;
        rankList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const switchClick = (item: (typeof switchList)[number]): void => {
      currentItem.value = item;
      void getInsStat();
    };

    const openInspect = (item: RankItem): void => {
      inspectParameter.depId = item.id;
      inspectParameter.status = currentItem.value === "任务数" ? "" : "OVER";
      inspectParameter.period = eventTime.value.dateRange?.join(",") ?? "";
      inspectModalShow.value = true;
    };

    onMounted(() => {
      void refresh();
    });

    const renderRankList = (isZoom: boolean): JSX.Element => {
      const visible = isZoom ? Math.max(VISIBLE_COUNT, 8) : VISIBLE_COUNT;
      const viewportPx = ITEM_HEIGHT * visible;
      const scroll = !isZoom && needScroll.value;

      if (!loaded.value) return <PanelCardLoading zoom={isZoom} />;
      if (rankList.value.length === 0) {
        return (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        );
      }

      const items = rankList.value.map((item, index) => (
        <button
          type="button"
          class={styles.rankItem}
          key={`${isZoom ? "zoom-" : ""}${item.id || item.name}-${index}`}
          onClick={() => openInspect(item)}
        >
          <EventAlarmItem sort={index + 1} name={item.name} linkRatio={item.chainRatio} count={item.number} ratio={`${item.ratio}%`} />
        </button>
      ));

      if (isZoom) {
        return (
          <div class={[styles.listSurface, styles.isZoomList, "access-control-card-theme"]} style={{ maxHeight: `${viewportPx}px` }}>
            {items}
          </div>
        );
      }

      return (
        <div
          class={[styles.listSurface, "access-control-card-theme"]}
          style={{ height: `${viewportHeight.value}px`, maxHeight: `${viewportHeight.value}px` }}
        >
          {scroll ? (
            <Vue3SeamlessScroll list={rankList.value} step={0.5} hover singleHeight={ITEM_HEIGHT} waitTime={2000}>
              {items}
            </Vue3SeamlessScroll>
          ) : (
            items
          )}
        </div>
      );
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <div class={[styles.statCard, styles.isTotal]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={taskTotalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>巡检任务数</span>
              <span class={[styles.statValue, styles.isTotalValue]}>
                <CountTo startVal={0} endVal={stats.total} separator="" duration={1400} />
              </span>
            </span>
          </div>
          <div class={[styles.statCard, styles.isPending]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={taskPendingIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>待接收</span>
              <span class={[styles.statValue, styles.isPendingValue]}>
                <CountTo startVal={0} endVal={stats.pending} separator="" duration={1400} />
              </span>
            </span>
          </div>
          <div class={[styles.statCard, styles.isProgress]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={taskProgressIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>进行中</span>
              <span class={[styles.statValue, styles.isProgressValue]}>
                <CountTo startVal={0} endVal={stats.underway} separator="" duration={1400} />
              </span>
            </span>
          </div>
        </div>

        <div class={styles.switchRow} data-no-zoom>
          {switchList.map((item) => (
            <button
              type="button"
              key={item}
              class={[styles.switchBtn, currentItem.value === item ? styles.isActive : ""]}
              onClick={() => switchClick(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {renderRankList(isZoom)}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card safety-inspection-statistics-v2-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-patrol" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={eventTime.value}
                    onUpdate:modelValue={(v) => {
                      eventTime.value = v;
                    }}
                    onSearch={refresh}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <SmallInspectTable
          showModal={inspectModalShow.value}
          onClose={() => {
            inspectModalShow.value = false;
          }}
          parameter={inspectParameter}
        />
      </>
    );
  },
});

export default SafetyInspectionStatistics;
