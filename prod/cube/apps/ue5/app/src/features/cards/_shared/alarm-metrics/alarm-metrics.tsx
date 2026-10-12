import { computed, defineComponent, type PropType } from "vue";

import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";

import styles from "./alarm-metrics.module.less";

const alarmCountIcon = getThemeImage("alarm-count.png");
const alarmHandledIcon = getThemeImage("alarm-count-handled.png");
const alarmUnhandledIcon = getThemeImage("alarm-count-unhandled.png");

interface AlarmTimeFilter {
  timeType?: string;
  dateRange?: string[];
}

type StatusTone = "pending" | "processing" | "suspend" | "done" | "default";

/** 将卡片当前时间筛选复制到报警弹窗，避免后续表单变更影响已打开的弹窗。 */
export const createAlarmModalParameter = (timeFilter?: AlarmTimeFilter, alarmStatus = ""): Record<string, unknown> => ({
  ...(timeFilter?.timeType ? { timeType: timeFilter.timeType } : {}),
  dateRange: [...(timeFilter?.dateRange ?? [])],
  ...(alarmStatus ? { alarmStatus } : {}),
});

/** 状态名 → 报警状态码，兼容接口返回的多种命名。 */
const alarmStatusMap: Record<string, string> = {
  待接收: "ALARM_UN_CONFIRMED",
  待确认: "ALARM_UN_CONFIRMED",
  处理中: "ALARM_PROGRESS_CONFIRMED",
  挂起: "ALARM_SUSPEND",
  已挂起: "ALARM_SUSPEND",
  已处理: "ALARM_HANDLER",
};

export const resolveAlarmStatus = (item?: AlarmStatus | null): string => {
  if (!item) return "";
  const rawStatus = typeof item.alarmStatus === "string" ? item.alarmStatus.trim() : "";
  if (rawStatus && rawStatus !== "false") {
    if (rawStatus.startsWith("ALARM_")) return rawStatus;
    return alarmStatusMap[rawStatus] || rawStatus;
  }
  return alarmStatusMap[String(item.alarmStatusName ?? "").trim()] || "";
};

const resolveStatusTone = (item: AlarmStatus): StatusTone => {
  const code = resolveAlarmStatus(item);
  const name = String(item.alarmStatusName ?? "").trim();
  if (code === "ALARM_UN_CONFIRMED" || name.includes("待")) return "pending";
  if (code === "ALARM_PROGRESS_CONFIRMED" || name.includes("处理中")) return "processing";
  if (code === "ALARM_SUSPEND" || name.includes("挂起")) return "suspend";
  if (code === "ALARM_HANDLER" || name.includes("已处理")) return "done";
  return "default";
};

const resolveStatusIcon = (tone: StatusTone): string => {
  if (tone === "pending") return alarmUnhandledIcon;
  if (tone === "done") return alarmHandledIcon;
  return alarmCountIcon;
};

const toneClassMap: Record<StatusTone, string> = {
  pending: styles.isPending,
  processing: styles.isProcessing,
  suspend: styles.isSuspend,
  done: styles.isDone,
  default: styles.isDefault,
};

export const AlarmMetrics = defineComponent({
  name: "AlarmMetrics",
  props: {
    count: { type: Number, default: 0 },
    ratio: { type: Number, default: 0 },
    statuses: { type: Array as PropType<AlarmStatus[]>, default: () => [] },
    zoom: { type: Boolean, default: false },
    /** flat：报警数与状态卡同一网格，避免上下/左右分区 */
    layout: { type: String as PropType<"stack" | "flat">, default: "stack" },
  },
  emits: {
    summaryClick: (_event: MouseEvent) => true,
    statusClick: (_event: MouseEvent, _item: AlarmStatus) => true,
  },
  setup(props, { emit }) {
    const statusCards = computed(() =>
      props.statuses.map((item) => {
        const tone = resolveStatusTone(item);
        return {
          item,
          tone,
          toneClass: toneClassMap[tone],
          icon: resolveStatusIcon(tone),
          valueColor: tone === "default" ? item.color : undefined,
        };
      }),
    );

    const onSummaryClick = (event: MouseEvent): void => {
      event.stopPropagation();
      emit("summaryClick", event);
    };

    const onStatusClick = (event: MouseEvent, item: AlarmStatus): void => {
      event.stopPropagation();
      emit("statusClick", event, item);
    };

    const renderSummaryCard = (flat: boolean): JSX.Element => (
      <button
        type="button"
        class={[styles.statCard, flat ? styles.statusCard : styles.summaryCard, styles.isTotal]}
        onClick={onSummaryClick}
      >
        <span class={[styles.statIcon, styles.statIconImage]} aria-hidden="true">
          <img src={alarmCountIcon} alt="" class={styles.statIconImg} />
        </span>
        <span class={styles.statContent}>
          <span class={styles.statLabel}>报警数</span>
          <span class={styles.statValue}>{props.count}</span>
        </span>
        <span class={styles.summaryRatio}>
          <span class={styles.ratioLabel}>环比</span>
          <span class={[styles.ratioArrow, props.ratio > 0 ? styles.ratioUp : ""]} />
          <span class={[styles.ratioValue, props.ratio < 0 ? styles.ratioDown : styles.ratioUp]}>{props.ratio}%</span>
        </span>
      </button>
    );

    const renderStatusCard = (item: AlarmStatus, toneClass: string, icon: string, valueColor: string | undefined): JSX.Element => (
      <button
        type="button"
        class={[styles.statCard, styles.statusCard, toneClass]}
        key={`${props.zoom ? "zoom-" : ""}${item.alarmStatus || item.alarmStatusName}`}
        onClick={(event) => onStatusClick(event, item)}
      >
        <span class={[styles.statIcon, styles.statIconImage]} aria-hidden="true">
          <img src={icon} alt="" class={styles.statIconImg} />
        </span>
        <span class={styles.statContent}>
          <span class={styles.statLabel}>{item.alarmStatusName}</span>
          <span class={styles.statValue} style={valueColor ? { color: valueColor } : undefined}>
            {item.alarmNum}
          </span>
        </span>
      </button>
    );

    return () => {
      const isFlat = props.layout === "flat";
      return (
        <div class={[styles.metrics, props.zoom ? styles.zoom : "", isFlat ? styles.flat : ""]} data-no-zoom>
          {isFlat ? (
            <div class={styles.flatGrid}>
              {renderSummaryCard(true)}
              {statusCards.value.map(({ item, toneClass, icon, valueColor }) => renderStatusCard(item, toneClass, icon, valueColor))}
            </div>
          ) : (
            <>
              {renderSummaryCard(false)}
              <div class={styles.statusGrid}>
                {statusCards.value.map(({ item, toneClass, icon, valueColor }) => renderStatusCard(item, toneClass, icon, valueColor))}
              </div>
            </>
          )}
        </div>
      );
    };
  },
});

export default AlarmMetrics;
