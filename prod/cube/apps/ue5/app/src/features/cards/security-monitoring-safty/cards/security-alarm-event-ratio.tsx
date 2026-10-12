import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getstatus, groupTotalSearch } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./security-alarm-event-ratio.module.less";

const titleIcon = getThemeImage("alarm-event.png");
const alarmCountIcon = getThemeImage("alarm-count.png");
const alarmUnhandledIcon = getThemeImage("alarm-count-unhandled.png");
const alarmHandledIcon = getThemeImage("alarm-count-handled.png");

const eventColors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#29C2FF", "#74AEE7", "#655DD1", "#B9D9FF", "#6EE3E1"];

type SummaryTone = "isTotal" | "isSuspend" | "isProcessing" | "isUnconfirmed" | "isHandled";

type SummaryCard = {
  key: string;
  label: string;
  value: number;
  tone: SummaryTone;
  icon: string;
  valueClass?: string;
  status?: string;
};

type EventPieItem = {
  id: string;
  name: string;
  value: number;
  color: string;
  percent: number;
};

const statusNum = (list: Array<{ alarmStatus?: string; alarmNum?: number }> | undefined, code: string): number => {
  const found = list?.find((item) => item.alarmStatus === code);
  return Number(found?.alarmNum) || 0;
};

export const SecurityAlarmEventRatio = defineComponent({
  name: "SecurityAlarmEventRatio",
  setup() {
    const { globalState } = useStateStore();
    const eventTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    const alarmModalShow = ref(false);
    const detectionData = ref<EventPieItem[]>([]);
    const summary = reactive({
      total: 0,
      suspend: 0,
      processing: 0,
      unconfirmed: 0,
      handled: 0,
    });
    const parameter = reactive({
      alarmEventTypeId: "" as string | undefined,
      dateRange: [] as string[],
      alarmStatus: "" as string | undefined,
    });

    const hasChartData = computed(() => detectionData.value.some((item) => item.value > 0));

    const summaryCards = computed<SummaryCard[]>(() => [
      {
        key: "total",
        label: "报警总数",
        value: summary.total,
        tone: "isTotal",
        icon: alarmCountIcon,
      },
      {
        key: "suspend",
        label: "挂起",
        value: summary.suspend,
        tone: "isSuspend",
        icon: alarmCountIcon,
        valueClass: styles.isSuspendValue,
        status: "ALARM_SUSPEND",
      },
      {
        key: "processing",
        label: "处理中",
        value: summary.processing,
        tone: "isProcessing",
        icon: alarmCountIcon,
        valueClass: styles.isProcessingValue,
        status: "ALARM_PROGRESS_CONFIRMED",
      },
      {
        key: "unconfirmed",
        label: "待确认",
        value: summary.unconfirmed,
        tone: "isUnconfirmed",
        icon: alarmUnhandledIcon,
        valueClass: styles.isUnconfirmedValue,
        status: "ALARM_UN_CONFIRMED",
      },
      {
        key: "handled",
        label: "已处理",
        value: summary.handled,
        tone: "isHandled",
        icon: alarmHandledIcon,
        valueClass: styles.isHandledValue,
        status: "ALARM_HANDLER",
      },
    ]);

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const openSummaryModal = (card: SummaryCard): void => {
      parameter.alarmStatus = card.status;
      parameter.alarmEventTypeId = undefined;
      parameter.dateRange = [...eventTime.value.dateRange];
      alarmModalShow.value = true;
    };

    const openEventModal = (item: EventPieItem): void => {
      parameter.alarmStatus = undefined;
      parameter.alarmEventTypeId = item.id;
      parameter.dateRange = [...eventTime.value.dateRange];
      alarmModalShow.value = true;
    };

    const onPieClick = (params: { data?: { originData?: EventPieItem } }): void => {
      const origin = params?.data?.originData;
      if (!origin?.id) return;
      openEventModal(origin);
    };

    const alarmEventTop = async (): Promise<void> => {
      try {
        const res = await getstatus({
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period: eventTime.value.dateRange.join(","),
          type: eventTime.value.timeType,
        });
        const statusList = Array.isArray(res?.alarmStatusStatistics) ? res.alarmStatusStatistics : [];
        summary.total = Number(res?.alarmNum) || 0;
        summary.suspend = statusNum(statusList, "ALARM_SUSPEND");
        summary.processing = statusNum(statusList, "ALARM_PROGRESS_CONFIRMED");
        summary.unconfirmed = statusNum(statusList, "ALARM_UN_CONFIRMED");
        summary.handled = statusNum(statusList, "ALARM_HANDLER");

        const data = await groupTotalSearch({
          areaId: globalState.business.currentAreaId,
          period: eventTime.value.dateRange.join(","),
          sceneType: globalState.business.currentMenu,
        });
        const list = Array.isArray(data) ? data : [];
        const total = list.reduce((sum, item) => sum + (Number(item.totalNum) || 0), 0) || 1;
        detectionData.value = list.map((item, index) => {
          const value = Number(item.totalNum) || 0;
          return {
            id: item.id,
            name: item.name,
            value,
            color: eventColors[index % eventColors.length],
            percent: Math.round((value / total) * 1000) / 10,
          };
        });
      } catch {
        summary.total = 0;
        summary.suspend = 0;
        summary.processing = 0;
        summary.unconfirmed = 0;
        summary.handled = 0;
        detectionData.value = [];
      }
    };

    let timer: ReturnType<typeof setInterval> | null = null;
    const init = (): void => {
      void alarmEventTop();
    };

    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["security-alarm-event-ratio-v2-panel", styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body"]}
        data-no-zoom
      >
        <div class={styles.statsRow}>
          {summaryCards.value.map((item) => (
            <button
              key={`${isZoom ? "zoom-" : ""}${item.key}`}
              type="button"
              class={[styles.statCard, styles[item.tone]]}
              onClick={() => openSummaryModal(item)}
            >
              <span class={styles.statIcon} aria-hidden="true">
                <img src={item.icon} alt="" />
              </span>
              <span class={styles.statContent}>
                <span class={styles.statLabel}>{item.label}</span>
                <span class={[styles.statValue, item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                </span>
              </span>
            </button>
          ))}
        </div>

        <div class={[styles.analysisSurface, hasChartData.value ? "" : styles.isEmpty]}>
          {hasChartData.value ? (
            <>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={detectionData.value} onClickbar={onPieClick}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={summary.total} separator="" duration={1600} />
                  </div>
                  <div class={styles.pieCenterLabel}>报警总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div
                class={[
                  styles.eventList,
                  detectionData.value.length > 0 && detectionData.value.length <= 4 ? styles.eventListCentered : "",
                ]}
              >
                {detectionData.value.map((item) => (
                  <button
                    key={`${isZoom ? "zoom-" : ""}${item.id || item.name}`}
                    type="button"
                    class={styles.eventItem}
                    onClick={() => openEventModal(item)}
                  >
                    <span class={styles.eventLeft}>
                      <span class={styles.eventColor} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span class={styles.eventName} title={item.name}>
                        {item.name}
                      </span>
                    </span>
                    <span class={styles.eventCount}>
                      {item.value}
                      <em class={styles.eventUnit}>个</em>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="报警事件占比"
            class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel security-alarm-event-ratio-v2-panel"
            zoomable
            zoom-title="报警事件占比详情"
            zoom-width={920}
            v-slots={{
              titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
              extra: () => (
                <div class="air-conditioning-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={eventTime.value}
                    onUpdate:modelValue={(v) => {
                      eventTime.value = v;
                    }}
                    onSearch={alarmEventTop}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTableNew showModal={alarmModalShow.value} onClose={closeModal} parameter={parameter} />
      </>
    );
  },
});

export default SecurityAlarmEventRatio;
