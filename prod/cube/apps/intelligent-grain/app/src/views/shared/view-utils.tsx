import dayjs from "dayjs";

import {
  GrainAlertStatus,
  GrainAlertType,
  GrainHealthLevel,
  GrainWarehouseType,
  type GrainAlertListItem,
  type GrainMetricValue,
  type GrainRuleConfig,
  type GrainWarehouseCard,
  type GrainWarehouseRuleRow,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { Space, Tag, type ColumnType } from "@ghcloud/cube-ui";

export const HEALTH_LABEL: Record<GrainHealthLevel, string> = {
  [GrainHealthLevel.GOOD]: "健康",
  [GrainHealthLevel.WARN]: "关注",
  [GrainHealthLevel.DANGER]: "危险",
};

export const HEALTH_COLOR: Record<GrainHealthLevel, string> = {
  [GrainHealthLevel.GOOD]: "green",
  [GrainHealthLevel.WARN]: "orange",
  [GrainHealthLevel.DANGER]: "red",
};

export const ALERT_STATUS_LABEL: Record<GrainAlertStatus, string> = {
  [GrainAlertStatus.PENDING]: "待确认",
  [GrainAlertStatus.PROCESSING]: "待处置",
  [GrainAlertStatus.REVIEWING]: "处置中",
  [GrainAlertStatus.CHECKING]: "待验收",
  [GrainAlertStatus.CLOSED]: "已闭环",
  [GrainAlertStatus.MISTAKE]: "误报",
  [GrainAlertStatus.AUTO_CLEARED]: "自动消除",
};

export const PRIMARY_ALERT_STATUSES: GrainAlertStatus[] = [
  GrainAlertStatus.PENDING,
  GrainAlertStatus.PROCESSING,
  GrainAlertStatus.REVIEWING,
  GrainAlertStatus.CHECKING,
  GrainAlertStatus.CLOSED,
];

const ALERT_STATUS_COLOR: Record<GrainAlertStatus, string> = {
  [GrainAlertStatus.PENDING]: "red",
  [GrainAlertStatus.PROCESSING]: "orange",
  [GrainAlertStatus.REVIEWING]: "blue",
  [GrainAlertStatus.CHECKING]: "purple",
  [GrainAlertStatus.CLOSED]: "green",
  [GrainAlertStatus.MISTAKE]: "default",
  [GrainAlertStatus.AUTO_CLEARED]: "cyan",
};

export const ALERT_TYPE_OPTIONS: Array<{ label: string; value: GrainAlertType }> = [
  { label: "温度超标", value: GrainAlertType.TEMPERATURE_OVER_LIMIT },
  { label: "储量异常", value: GrainAlertType.STORAGE_ABNORMAL },
  { label: "气体超标", value: GrainAlertType.GAS_OVER_LIMIT },
  { label: "湿度超标", value: GrainAlertType.HUMIDITY_OVER_LIMIT },
  { label: "温度趋势", value: GrainAlertType.TEMPERATURE_TREND },
  { label: "逼近危险区", value: GrainAlertType.APPROACH_DANGER },
  { label: "健康度骤降", value: GrainAlertType.HEALTH_SCORE_DROP },
  { label: "异常出库", value: GrainAlertType.ABNORMAL_OUTBOUND },
  { label: "结露霉变", value: GrainAlertType.CONDENSATION_MILDEW },
  { label: "自热风险", value: GrainAlertType.SELF_HEATING_RISK },
  { label: "内部自热", value: GrainAlertType.INTERNAL_SELF_HEATING },
  { label: "局部聚集", value: GrainAlertType.LOCAL_AGGREGATION },
  { label: "品质超标", value: GrainAlertType.QUALITY_OVER_LIMIT },
  { label: "结露高风险", value: GrainAlertType.CONDENSATION_HIGH_RISK },
  { label: "霉变高风险", value: GrainAlertType.MILDEW_HIGH_RISK },
  { label: "虫害高风险", value: GrainAlertType.PEST_HIGH_RISK },
];

export const RULE_SUMMARY_KEYS: Array<{ key: keyof GrainRuleConfig; label: string }> = [
  { key: "temperature", label: "温度规则" },
  { key: "storage", label: "仓容规则" },
  { key: "humidity", label: "湿度规则" },
  { key: "gas", label: "气体规则" },
  { key: "escalation", label: "升级策略" },
  { key: "alertScan", label: "告警扫描" },
];

export const REAL_REASON_OPTIONS = [
  ...ALERT_TYPE_OPTIONS,
  { label: "跨维度关联触发", value: "CROSS_DIMENSION_LINKAGE" },
  { label: "其他", value: "OTHER" },
];

export function formatRealReason(value?: string | null): string {
  if (!value) {
    return "--";
  }
  return REAL_REASON_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function formatTime(value?: string): string {
  if (!value) {
    return "--";
  }
  const time = dayjs(value);
  return time.isValid() ? time.format("YYYY-MM-DD HH:mm") : value;
}

export function formatMetric(metric?: GrainMetricValue): string {
  if (!metric || metric.value === undefined || metric.value === null) {
    return "--";
  }
  return `${metric.value}${metric.unit ?? ""}`;
}

const WAREHOUSE_TYPE_IMAGE: Record<string, string> = {
  [GrainWarehouseType.SHALLOW_ROUND]: "/resource/v1/cube-intelligent-grain/qyc.png",
  [GrainWarehouseType.VERTICAL_SILO]: "/resource/v1/cube-intelligent-grain/ltc.png",
  [GrainWarehouseType.FLAT_WAREHOUSE]: "/resource/v1/cube-intelligent-grain/pfc.png",
  浅圆仓: "/resource/v1/cube-intelligent-grain/qyc.png",
  立筒仓: "/resource/v1/cube-intelligent-grain/ltc.png",
  平房仓: "/resource/v1/cube-intelligent-grain/pfc.png",
};

function warehouseImage(type?: string | null): string {
  const value = type?.trim();
  if (!value) {
    return WAREHOUSE_TYPE_IMAGE[GrainWarehouseType.FLAT_WAREHOUSE];
  }
  return (
    WAREHOUSE_TYPE_IMAGE[value.toUpperCase()] ?? WAREHOUSE_TYPE_IMAGE[value] ?? WAREHOUSE_TYPE_IMAGE[GrainWarehouseType.FLAT_WAREHOUSE]
  );
}

function metricHint(metric?: GrainMetricValue, normalText = "稳定"): string {
  if (!metric || metric.value === undefined || metric.value === null) {
    return "数据中断";
  }
  if (metric.status === "OFFLINE") {
    return "数据中断";
  }
  if (metric.status === "ALARM") {
    return "超过规则阈值";
  }
  return normalText;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function renderWarehouseCard(card: GrainWarehouseCard, selected = false, onSelect?: () => void): JSX.Element {
  const score = card.healthScore ?? 0;
  const isOffline = Boolean(card.offline);
  const scoreText = card.healthScore === undefined || card.healthScore === null ? "--" : String(score);
  const scoreLabel = HEALTH_LABEL[card.healthLevel];
  const statusClass = `is-${card.healthLevel.toLowerCase()}`;
  const alertLevel = card.activeAlert?.level;

  return (
    <button
      class={["ig-warehouse-card", statusClass, isOffline ? "is-offline" : "", selected ? "is-selected" : ""]}
      onClick={onSelect}
      type="button"
    >
      <div class="ig-warehouse-card__body">
        <div class="ig-warehouse-card__info">
          <div class="ig-warehouse-card__head">
            <div>
              <div class="ig-warehouse-card__name">{card.warehouseName}</div>
              <div class="ig-warehouse-card__meta">{card.grainType || "--"}</div>
            </div>
            {isOffline ? <Tag>离线</Tag> : null}
          </div>

          <div class="ig-warehouse-card__score-row">
            <strong>{scoreText}</strong>
            <span>{scoreLabel}</span>
          </div>

          <div class="ig-warehouse-card__facts">
            <div class="ig-warehouse-card__fact">
              <span>
                <i class="is-temperature" />
                最高温
              </span>
              <strong>{formatMetric(card.temperature)}</strong>
            </div>
            <div class="ig-warehouse-card__fact">
              <span>
                <i class="is-storage" />
                储量
              </span>
              <strong>{formatMetric(card.storage)}</strong>
            </div>
          </div>

          <div class="ig-warehouse-card__fact-hints">
            <em>{metricHint(card.temperature, "日最高温稳定")}</em>
            <em>{metricHint(card.storage, "库存稳定")}</em>
          </div>
        </div>
        <img class="ig-warehouse-card__image" src={warehouseImage(card.warehouseType)} alt="" />
      </div>

      {isOffline ? (
        <div class="ig-warehouse-card__notice is-offline">
          <span>物联中心数据中断，暂停监测</span>
        </div>
      ) : card.activeAlert ? (
        <div class="ig-warehouse-card__notice is-alert">
          <Tag color={alertLevel && alertLevel <= 2 ? "red" : "orange"}>{alertLevel ?? "--"}级</Tag>
          <span>
            {card.activeAlert.alertTypeName} · {formatTime(card.activeAlert.triggeredAt)}
          </span>
        </div>
      ) : (
        <div class="ig-warehouse-card__notice is-normal">
          <span>无告警</span>
        </div>
      )}
    </button>
  );
}

export function renderAlertStatus(status: GrainAlertStatus): JSX.Element {
  return <Tag color={ALERT_STATUS_COLOR[status]}>{ALERT_STATUS_LABEL[status]}</Tag>;
}

export const alertColumns: ColumnType<GrainAlertListItem>[] = [
  { title: "告警仓房", dataIndex: "warehouseName", width: 180 },
  { title: "告警类型", dataIndex: "alertTypeName", width: 180 },
  {
    title: "等级",
    dataIndex: "level",
    width: 80,
    customRender: ({ text }: { text: number }) => <Tag color={text <= 2 ? "red" : "orange"}>{text}级</Tag>,
  },
  { title: "当前值", dataIndex: "currentValueText", width: 120 },
  {
    title: "阈值",
    dataIndex: "thresholdText",
    width: 140,
    customRender: ({ text }: { text?: string }) => text || "--",
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 120,
    customRender: ({ text }: { text: GrainAlertStatus }) => renderAlertStatus(text),
  },
  {
    title: "触发时间",
    dataIndex: "triggeredAt",
    width: 160,
    customRender: ({ text }: { text?: string }) => formatTime(text),
  },
];

export const ruleColumns: ColumnType<GrainWarehouseRuleRow>[] = [
  { title: "仓房", dataIndex: "warehouseName", width: 180 },
  { title: "粮食品种", dataIndex: "grainType", width: 120, customRender: ({ text }: { text?: string }) => text || "--" },
  {
    title: "单仓覆盖规则",
    dataIndex: "overrideDimensions",
    customRender: ({ record }: { record: GrainWarehouseRuleRow }) => (
      <Space wrap>
        {record.overrideDimensions.length > 0 ? (
          record.overrideDimensions.map((item) => (
            <Tag key={item.dimension} color="blue">
              {item.summary}
            </Tag>
          ))
        ) : (
          <Tag>沿用全局规则</Tag>
        )}
      </Space>
    ),
  },
  {
    title: "更新时间",
    dataIndex: "updatedAt",
    width: 160,
    customRender: ({ text }: { text?: string }) => formatTime(text),
  },
];
