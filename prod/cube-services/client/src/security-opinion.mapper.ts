import type { Pagination } from "@ghcloud/cube-service-interface/base";
import type {
  ChartItemVO,
  CollectFrequency,
  CollectTimeRange,
  DedupStrategy,
  HotEventVO,
  KeywordItemVO,
  KeywordRuleVO,
  KeywordType,
  MatchStrategy,
  OpinionVO,
  PageAlertReceiversParams,
  PageAlertsParams,
  Sentiment,
  PageOpinionsParams,
  PageReviewReportsParams,
  PublicOpinionAlertChannelVO,
  PublicOpinionAlertEventVO,
  PublicOpinionAlertNotificationConfigVO,
  PublicOpinionAlertPushRecordVO,
  PublicOpinionAlertReceiverVO,
  PublicOpinionAlertVO,
  PublicOpinionResponseActionVO,
  PublicOpinionReviewReportVO,
  PublicOpinionTimelineNodeVO,
  SourceModifyParam,
  SourceStatus,
  SourceVO,
  StatisticsOverviewVO,
  TrashItemVO,
  WarningLevel,
} from "@ghcloud/cube-service-interface/security-opinion";

const SENTIMENT_TO_BACKEND: Record<Sentiment, string> = {
  positive: "POSITIVE",
  neutral: "NEUTRAL",
  negative: "NEGATIVE",
  unknown: "UNKNOWN",
};

const SENTIMENT_FROM_BACKEND: Record<string, Sentiment> = {
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  NEGATIVE: "negative",
  UNKNOWN: "unknown",
};

const WARNING_LEVEL_FROM_BACKEND: Record<string, WarningLevel> = {
  BLUE: "BLUE",
  BLUE_WARNING: "BLUE",
  YELLOW: "YELLOW",
  YELLOW_WARNING: "YELLOW",
  RED: "RED",
  RED_WARNING: "RED",
};

const WARNING_LEVEL_LABEL: Record<WarningLevel, string> = {
  BLUE: "蓝色",
  YELLOW: "黄色",
  RED: "红色",
};

const MATCH_TO_BACKEND: Record<MatchStrategy, string> = {
  any: "ANY",
  all: "ALL",
  atLeastN: "AT_LEAST_N",
};

const MATCH_FROM_BACKEND: Record<string, MatchStrategy> = {
  ANY: "any",
  ALL: "all",
  AT_LEAST_N: "atLeastN",
};

const DEDUP_TO_BACKEND: Record<DedupStrategy, string> = {
  title: "TITLE",
  url: "URL",
  content: "CONTENT",
  none: "NONE",
};

const DEDUP_FROM_BACKEND: Record<string, DedupStrategy> = {
  TITLE: "title",
  URL: "url",
  CONTENT: "content",
  NONE: "none",
};

const HOURS_TO_RANGE: Record<number, CollectTimeRange> = {
  1: "1h",
  6: "6h",
  12: "12h",
  24: "24h",
  72: "3d",
  168: "7d",
};

const RANGE_TO_HOURS: Record<CollectTimeRange, number> = {
  "1h": 1,
  "6h": 6,
  "12h": 12,
  "24h": 24,
  "3d": 72,
  "7d": 168,
};

const KEYWORD_TYPE_TO_BACKEND: Record<KeywordType, string> = {
  include: "INCLUDE",
  exclude: "EXCLUDE",
};

export const toBackendKeywordType = (type: KeywordType): string => KEYWORD_TYPE_TO_BACKEND[type];

export const toBackendSentiment = (sentiment?: Sentiment | ""): string | undefined =>
  sentiment ? SENTIMENT_TO_BACKEND[sentiment] : undefined;

export const fromBackendSentiment = (sentiment?: string): Sentiment => SENTIMENT_FROM_BACKEND[sentiment?.toUpperCase() ?? ""] ?? "unknown";

export const fromBackendWarningLevel = (level?: string): WarningLevel | string | undefined => {
  const normalized = level?.trim().toUpperCase();
  if (!normalized) return undefined;
  return WARNING_LEVEL_FROM_BACKEND[normalized] ?? normalized;
};

const warningLevelLabel = (level?: string, fallback?: unknown): string | undefined => {
  const text = String(fallback ?? "").trim();
  if (text) return text;
  const mapped = fromBackendWarningLevel(level);
  return mapped && mapped in WARNING_LEVEL_LABEL ? WARNING_LEVEL_LABEL[mapped as WarningLevel] : undefined;
};

const readString = (raw: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const readNumber = (raw: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") {
      const numberValue = Number(value);
      if (Number.isFinite(numberValue)) return numberValue;
    }
  }
  return undefined;
};

const readStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return parsed
            .map(String)
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } catch {
        // fall back to delimiter parsing below
      }
    }
    return text
      .split(/[,\n，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const readJoinedString = (raw: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const values = readStringArray(raw[key]);
    if (values.length) return values.join("、");
    const value = raw[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const SOURCE_MAX_ITEMS = 50;

const clampSourceMaxItems = (value: number): number => Math.min(Math.max(1, Math.trunc(value)), SOURCE_MAX_ITEMS);

export const toBackendSourcePayload = (payload: SourceModifyParam): Record<string, unknown> => ({
  sourceName: payload.name,
  url: payload.url,
  frequencyMinutes: Number(payload.frequency),
  maxItems: clampSourceMaxItems(payload.maxItems),
});

export const fromBackendSource = (raw: Record<string, unknown>): SourceVO => ({
  id: String(raw.id ?? ""),
  name: String(raw.sourceName ?? ""),
  url: String(raw.url ?? ""),
  frequency: String(raw.frequencyMinutes ?? "15") as CollectFrequency,
  maxItems: clampSourceMaxItems(Number(raw.maxItems ?? SOURCE_MAX_ITEMS)),
  status: mapSourceStatus(String(raw.status ?? "")),
});

const mapSourceStatus = (status: string): SourceStatus => {
  const upper = status.toUpperCase();
  if (upper === "PAUSED") return "paused";
  if (upper === "ABNORMAL") return "abnormal";
  return "running";
};

/** 详情作者：兼容后端多种字段名（与 sourceName 命名风格一致） */
const readAuthor = (raw: Record<string, unknown>): string => {
  const value = raw.author ?? raw.authorName ?? raw.publishAuthor ?? raw.publisher ?? raw.creator;
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
};

export const unwrapBackendRecord = (raw: Record<string, unknown>): Record<string, unknown> => {
  const nested = raw.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return raw;
};

export const fromBackendOpinionPage = (raw: Record<string, unknown>): OpinionVO => ({
  id: String(raw.id ?? ""),
  title: String(raw.title ?? ""),
  summary: readString(raw, ["summary", "description", "contentSummary"]),
  source: readString(raw, ["sourceName", "source", "sourceDisplay"]),
  sentiment: fromBackendSentiment(String(raw.sentiment ?? "")),
  collectedAt: readString(raw, ["collectTime", "collectedAt", "publishTime"]),
  url: readString(raw, ["originalUrl", "url"]),
  author: readAuthor(raw),
  keywords: readStringArray(raw.matchedKeywords ?? raw.keywords),
  content: "",
  heatIndex: readNumber(raw, ["heatIndex", "heat"]),
  heatSource: readString(raw, ["heatSource"]),
  warningLevel: fromBackendWarningLevel(String(raw.warningLevel ?? raw.level ?? "")),
  warningLevelText: warningLevelLabel(String(raw.warningLevel ?? raw.level ?? ""), raw.warningLevelText ?? raw.levelText),
  alertTime: readString(raw, ["alertTime", "warningTime"]),
  pushStatus: readString(raw, ["pushStatus"]),
  pushStatusText: readString(raw, ["pushStatusText"]),
  lastPushTime: readString(raw, ["lastPushTime", "pushTime"]),
  pushCount: readNumber(raw, ["pushCount"]),
  lastPushFailureReason: readString(raw, ["lastPushFailureReason", "failureReason"]),
  relatedEventId: readString(raw, ["relatedEventId", "eventId"]),
  relatedEventName: readString(raw, ["relatedEventTitle", "relatedEventName", "eventTitle", "eventName", "relatedEventNo"]),
});

export const fromBackendOpinionDetail = (raw: Record<string, unknown>): OpinionVO => {
  const item = unwrapBackendRecord(raw);
  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    summary: String(item.summary ?? ""),
    source: readString(item, ["sourceName", "source", "sourceDisplay"]),
    sentiment: fromBackendSentiment(String(item.sentiment ?? "")),
    collectedAt: readString(item, ["collectTime", "collectedAt", "publishTime"]),
    url: readString(item, ["originalUrl", "url"]),
    author: readAuthor(item),
    keywords: readStringArray(item.matchedKeywords ?? item.keywords),
    content: String(item.content ?? ""),
    heatIndex: readNumber(item, ["heatIndex", "heat"]),
    heatSource: readString(item, ["heatSource"]),
    warningLevel: fromBackendWarningLevel(String(item.warningLevel ?? item.level ?? "")),
    warningLevelText: warningLevelLabel(String(item.warningLevel ?? item.level ?? ""), item.warningLevelText ?? item.levelText),
    alertTime: readString(item, ["alertTime", "warningTime"]),
    pushStatus: readString(item, ["pushStatus"]),
    pushStatusText: readString(item, ["pushStatusText"]),
    lastPushTime: readString(item, ["lastPushTime", "pushTime"]),
    pushCount: readNumber(item, ["pushCount"]),
    lastPushFailureReason: readString(item, ["lastPushFailureReason", "failureReason"]),
    relatedEventId: readString(item, ["relatedEventId", "eventId"]),
    relatedEventName: readString(item, ["relatedEventTitle", "relatedEventName", "eventTitle", "eventName", "relatedEventNo"]),
  };
};

export const fromBackendKeywordRule = (raw: Record<string, unknown>): KeywordRuleVO => ({
  matchStrategy: MATCH_FROM_BACKEND[String(raw.matchStrategy ?? "ANY")] ?? "any",
  minMatchCount: Number(raw.minMatchCount ?? 2),
  dedupStrategy: DEDUP_FROM_BACKEND[String(raw.dedupeStrategy ?? "TITLE")] ?? "title",
  collectTimeRange: HOURS_TO_RANGE[Number(raw.collectTimeRangeHours ?? 6)] ?? "6h",
});

export const toBackendKeywordRule = (payload: KeywordRuleVO): Record<string, unknown> => ({
  matchStrategy: MATCH_TO_BACKEND[payload.matchStrategy],
  minMatchCount: payload.minMatchCount,
  dedupeStrategy: DEDUP_TO_BACKEND[payload.dedupStrategy],
  collectTimeRangeHours: RANGE_TO_HOURS[payload.collectTimeRange],
});

export const fromBackendKeyword = (raw: Record<string, unknown>): KeywordItemVO => ({
  id: String(raw.id ?? ""),
  keywordText: String(raw.keywordText ?? ""),
  preset: Boolean(raw.preset),
});

/** 预设词库：兼容 string[] 或 { keywordText }[] */
export const fromBackendKeywordPresets = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (item && typeof item === "object" && "keywordText" in item) {
        return String((item as Record<string, unknown>).keywordText ?? "").trim();
      }
      return "";
    })
    .filter((text) => text.length > 0);
};

export const fromBackendOverview = (raw: Record<string, unknown>): StatisticsOverviewVO => ({
  total: Number(raw.totalCount ?? 0),
  negativeCount: Number(raw.negativeCount ?? 0),
  sourceCount: Number(raw.sourceCount ?? 0),
  /** 后端 negativeRatio 为百分比数值，如 35 表示 35% */
  negativeRate: Math.round(Number(raw.negativeRatio ?? 0)),
});

export const fromBackendSentimentChart = (items: Record<string, unknown>[]): ChartItemVO[] =>
  items.map((item) => ({
    name: sentimentLabel(fromBackendSentiment(String(item.sentiment ?? ""))),
    value: Number(item.count ?? 0),
  }));

export const fromBackendSourceChart = (items: Record<string, unknown>[]): ChartItemVO[] =>
  items.map((item) => ({
    name: String(item.sourceName ?? ""),
    value: Number(item.count ?? 0),
  }));

export const fromBackendTrendChart = (items: Record<string, unknown>[]): ChartItemVO[] =>
  items.map((item) => ({
    name: String(item.timeBucket ?? ""),
    value: Number(item.count ?? 0),
  }));

export const fromBackendKeywordRank = (items: Record<string, unknown>[]): ChartItemVO[] =>
  items.map((item) => ({
    name: String(item.keywordText ?? ""),
    value: Number(item.count ?? 0),
  }));

export const fromBackendHotEvents = (items: Record<string, unknown>[]): HotEventVO[] =>
  items.map((item, idx) => ({
    rank: idx + 1,
    title: String(item.eventName ?? ""),
    channelText: String(item.sourceDisplay ?? ""),
    score: Number(item.score ?? 0),
  }));

export const fromBackendTrash = (raw: Record<string, unknown>): TrashItemVO => ({
  id: String(raw.id ?? ""),
  title: String(raw.title ?? ""),
  source: String(raw.sourceName ?? ""),
  author: readString(raw, ["author"]),
  url: readString(raw, ["originalUrl", "url"]),
  summary: readString(raw, ["summary"]),
  content: readString(raw, ["content"]),
  publishTime: readString(raw, ["publishTime"]),
  filterReason: String(raw.filterReason ?? ""),
  keywords: readStringArray(raw.matchedKeywords ?? raw.matchedKeywordsJson ?? raw.keywords),
  excludedKeywords: readStringArray(raw.excludedKeywords ?? raw.excludedKeywordsJson),
  primaryKeyword: readString(raw, ["primaryKeyword"]),
  collectedAt: String(raw.collectTime ?? ""),
});

export const mapAlertPageParams = (params: PageAlertsParams): Record<string, unknown> => ({
  pageNumber: params.pageNumber,
  pageSize: params.pageSize,
  keyword: params.keyword,
  warningLevel: params.warningLevel || undefined,
  pushStatus: params.pushStatus || undefined,
  startTime: params.startTime,
  endTime: params.endTime,
});

export const fromBackendAlert = (raw: Record<string, unknown>): PublicOpinionAlertVO => {
  const opinion = fromBackendOpinionPage(raw);
  return {
    ...opinion,
    id: readString(raw, ["opinionId", "id"]) || opinion.id,
    opinionId: readString(raw, ["opinionId", "id"]) || opinion.id,
    sceneCode: readString(raw, ["sceneCode"]),
  };
};

export const fromBackendAlertChannel = (raw: Record<string, unknown>): PublicOpinionAlertChannelVO => ({
  channelCode: readString(raw, ["channelCode", "code", "channel"]),
  channelName: readString(raw, ["channelName", "name", "channelText"]) || readString(raw, ["channelCode", "code", "channel"]),
});

export const fromBackendAlertReceiver = (raw: Record<string, unknown>): PublicOpinionAlertReceiverVO => {
  const id = readString(raw, ["id", "userId"]);
  const userId = readString(raw, ["userId", "id"]);
  return {
    id,
    userId,
    name: readString(raw, ["name"]),
    userName: readString(raw, ["userName", "username"]),
    mobile: readString(raw, ["mobile", "phone"]),
    organizationName: readString(raw, ["organizationName", "orgName", "departmentName"]),
  };
};

export const mapAlertReceiverPageParams = (params: PageAlertReceiversParams): Record<string, unknown> => ({
  pageNumber: params.pageNumber,
  pageSize: params.pageSize,
  keyword: params.keyword,
});

const readJsonListText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean)
      .join("、");
  }
  const text = String(value ?? "").trim();
  if (!text) return "";
  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean)
        .join("、");
    }
  } catch {
    return text;
  }
  return text;
};

export const fromBackendPushRecord = (raw: Record<string, unknown>): PublicOpinionAlertPushRecordVO => {
  const channelText = readString(raw, ["channelText", "channelName"]);
  const channelFallback = readString(raw, ["channel"]) || readJsonListText(raw.channelsJson);
  const receiverText = readString(raw, ["receiverName", "userName", "name"]);
  const receiverFallback = readString(raw, ["receiverUserId", "userId"]) || readJsonListText(raw.receiverUserIdsJson);
  const pushStatus = readString(raw, ["pushStatus", "status"]);
  const pushStatusText = readString(raw, ["pushStatusText", "statusText"]);
  const success = typeof raw.success === "boolean" ? raw.success : undefined;
  const mappedStatus = pushStatus || (success === undefined ? "" : success ? "SENT" : "FAILED");
  const mappedStatusText = pushStatusText || (success === undefined ? "" : success ? "已推送" : "推送失败");
  return {
    id: readString(raw, ["id", "recordId"]),
    opinionId: readString(raw, ["opinionId"]),
    warningLevel: fromBackendWarningLevel(readString(raw, ["warningLevel", "level"])),
    warningLevelText: warningLevelLabel(readString(raw, ["warningLevel", "level"]), raw.warningLevelText),
    pushType: readString(raw, ["pushType"]),
    pushTypeText: readString(raw, ["pushTypeText"]),
    sceneCode: readString(raw, ["sceneCode"]),
    notifyId: readString(raw, ["notifyId"]),
    channelsJson: readString(raw, ["channelsJson"]),
    receiverUserIdsJson: readString(raw, ["receiverUserIdsJson"]),
    success,
    responseCode: readString(raw, ["responseCode"]),
    responseMessage: readString(raw, ["responseMessage"]),
    channel: channelFallback || channelText,
    channelText,
    receiverUserId: receiverFallback || receiverText,
    receiverName: receiverText,
    pushStatus: mappedStatus,
    pushStatusText: mappedStatusText,
    pushTime: readString(raw, ["pushTime", "sendTime", "createTime"]),
    failureReason: readString(raw, ["failureReason", "lastPushFailureReason", "errorMessage", "responseMessage"]),
  };
};

const fromBackendTimelineNode = (raw: Record<string, unknown>): PublicOpinionTimelineNodeVO => ({
  id: readString(raw, ["id"]),
  time: readString(raw, ["time", "actionTime", "nodeTime"]),
  actionTime: readString(raw, ["actionTime", "time", "nodeTime"]),
  type: readString(raw, ["type", "nodeType", "actionType"]),
  node: readString(raw, ["node", "title", "content", "description", "actionContent"]),
  content: readString(raw, ["content", "description", "node", "actionContent"]),
  description: readString(raw, ["description", "content", "node", "actionContent"]),
});

const fromBackendResponseAction = (raw: Record<string, unknown>): PublicOpinionResponseActionVO => ({
  actionTime: readString(raw, ["actionTime", "time", "createTime"]),
  actionType: readString(raw, ["actionType", "type"]),
  actionContent: readString(raw, ["actionContent", "content", "description"]),
  operatorUserId: readString(raw, ["operatorUserId"]),
  operatorName: readString(raw, ["operatorName", "operator", "userName"]),
});

const readTimeline = (raw: Record<string, unknown>): PublicOpinionTimelineNodeVO[] => {
  const value = raw.timeline ?? raw.timelineNodes;
  return Array.isArray(value) ? value.map((item) => fromBackendTimelineNode(item as Record<string, unknown>)) : [];
};

const readResponseActions = (raw: Record<string, unknown>): PublicOpinionResponseActionVO[] => {
  const value = raw.responseActions ?? raw.actions;
  return Array.isArray(value) ? value.map((item) => fromBackendResponseAction(item as Record<string, unknown>)) : [];
};

export const fromBackendAlertEvent = (raw: Record<string, unknown>): PublicOpinionAlertEventVO => {
  const item = unwrapBackendRecord(raw);
  const opinionRaw = item.opinion;
  const level = readString(item, ["warningLevel", "level"]);
  return {
    eventId: readString(item, ["eventId", "id", "relatedEventId"]),
    eventCode: readString(item, ["eventCode", "code"]),
    eventName: readString(item, ["eventName", "eventTitle", "name", "title"]),
    title: readString(item, ["title", "eventName", "eventTitle", "name"]),
    warningLevel: fromBackendWarningLevel(level),
    warningLevelText: warningLevelLabel(level, item.warningLevelText ?? item.levelText),
    heatIndex: readNumber(item, ["heatIndex", "maxHeatIndex", "heat"]),
    source: readJoinedString(item, ["sourceNames"]) || readString(item, ["sourceName", "source", "sourceDisplay"]),
    sentiment: fromBackendSentiment(readString(item, ["sentiment"])),
    alertTime: readString(item, ["alertTime", "firstAlertTime", "lastAlertTime", "warningTime"]),
    status: readString(item, ["status", "eventStatus"]),
    statusText: readString(item, ["statusText", "eventStatusText"]),
    eventStatus: readString(item, ["eventStatus", "status"]),
    eventStatusText: readString(item, ["eventStatusText", "statusText"]),
    archiveStatus: readString(item, ["archiveStatus"]),
    archiveTime: readString(item, ["archiveTime", "archivedTime", "archivedAt"]),
    archiveRemark: readString(item, ["archiveRemark", "remark"]),
    summary: readString(item, ["summary", "description"]),
    keywords: readStringArray(item.keywords ?? item.keywordJson ?? item.matchedKeywords),
    timeline: readTimeline(item),
    responseActions: readResponseActions(item),
    opinion: opinionRaw && typeof opinionRaw === "object" ? fromBackendOpinionDetail(opinionRaw as Record<string, unknown>) : undefined,
  };
};

export const fromBackendNotificationConfig = (raw: Record<string, unknown>): PublicOpinionAlertNotificationConfigVO => {
  const data = unwrapBackendRecord(raw);
  const configs = Array.isArray(data.configs) ? data.configs : Array.isArray(raw) ? raw : [];
  return {
    configs: configs.map((item) => {
      const cfg = item as Record<string, unknown>;
      const receivers = Array.isArray(cfg.receivers) ? cfg.receivers : [];
      const mappedReceivers = receivers.map((receiver) => fromBackendAlertReceiver(receiver as Record<string, unknown>));
      return {
        warningLevel: fromBackendWarningLevel(readString(cfg, ["warningLevel", "level"])) ?? readString(cfg, ["warningLevel", "level"]),
        sceneCode: readString(cfg, ["sceneCode"]),
        defaultChannels: readStringArray(cfg.defaultChannels),
        channels: readStringArray(cfg.channels),
        receiverUserIds: Array.isArray(cfg.receiverUserIds)
          ? cfg.receiverUserIds
              .map(String)
              .map((id) => id.trim())
              .filter(Boolean)
          : mappedReceivers.map((receiver) => receiver.userId || receiver.id).filter(Boolean),
        receivers: mappedReceivers,
      };
    }),
  };
};

export const mapReviewReportPageParams = (params: PageReviewReportsParams): Record<string, unknown> => ({
  pageNumber: params.pageNumber,
  pageSize: params.pageSize,
  keyword: params.keyword,
  reportStatus: params.reportStatus || undefined,
  startTime: params.startTime,
  endTime: params.endTime,
});

export const fromBackendReviewReport = (raw: Record<string, unknown>): PublicOpinionReviewReportVO => {
  const item = unwrapBackendRecord(raw);
  const embeddedEvent =
    item.event && typeof item.event === "object" && !Array.isArray(item.event) ? (item.event as Record<string, unknown>) : undefined;
  const eventRaw: Record<string, unknown> = embeddedEvent ? { ...embeddedEvent } : item;
  [
    "status",
    "statusText",
    "eventStatus",
    "eventStatusText",
    "archiveStatus",
    "archiveTime",
    "archivedTime",
    "archiveRemark",
    "eventTitle",
    "maxHeatIndex",
    "sourceNames",
    "sourceName",
    "source",
    "sourceDisplay",
    "firstAlertTime",
    "lastAlertTime",
    "alertTime",
    "warningLevel",
    "warningLevelText",
    "level",
    "levelText",
    "keywords",
    "keywordJson",
    "matchedKeywords",
  ].forEach((key) => {
    if ((eventRaw[key] === undefined || eventRaw[key] === null || eventRaw[key] === "") && item[key] !== undefined) {
      eventRaw[key] = item[key];
    }
  });
  const event = fromBackendAlertEvent(eventRaw);
  const hasReport = item.report && typeof item.report === "object" && !Array.isArray(item.report);
  const report = hasReport ? (item.report as Record<string, unknown>) : item;
  const reportStatus = hasReport
    ? readString(report, ["reportStatus", "status"]) || readString(item, ["reportStatus"])
    : readString(item, ["reportStatus"]);
  return {
    ...event,
    reportId: readString(report, ["reportId", "id"]),
    reportName: readString(report, ["reportName", "name"]),
    reportStatus: reportStatus || undefined,
    reportStatusText: hasReport
      ? readString(report, ["reportStatusText", "statusText"]) || readString(item, ["reportStatusText"])
      : readString(item, ["reportStatusText"]),
    degraded: Boolean(report.degraded ?? item.degraded),
    overview: readString(report, ["overview"]),
    spreadPath: readString(report, ["spreadPath"]),
    responseProcess: readString(report, ["responseProcess"]),
    improvementSuggestions: readString(report, ["improvementSuggestions"]),
    contentJson: report.contentJson ?? item.contentJson,
    timeline: event.timeline?.length ? event.timeline : readTimeline(report),
    responseActions: event.responseActions?.length ? event.responseActions : readResponseActions(report),
  };
};

export const mapOpinionPageParams = (params: PageOpinionsParams): Record<string, unknown> => ({
  pageNumber: params.pageNumber,
  pageSize: params.pageSize,
  keyword: params.keyword,
  sourceName: params.source,
  sentiment: toBackendSentiment(params.sentiment),
  startTime: params.timeStart,
  endTime: params.timeEnd,
  warningLevel: params.warningLevel || undefined,
  pushStatus: params.pushStatus || undefined,
  minHeatIndex: params.minHeatIndex,
  maxHeatIndex: params.maxHeatIndex,
});

export const mapPagination = <T>(
  raw: Pagination<Record<string, unknown>>,
  mapper: (item: Record<string, unknown>) => T,
): Pagination<T> => ({
  total: raw.total,
  pages: raw.pages,
  records: raw.records.map((item) => mapper(item)),
});

const sentimentLabel = (sentiment: Sentiment): string => {
  const labels: Record<Sentiment, string> = {
    positive: "正面",
    neutral: "中性",
    negative: "负面",
    unknown: "未知",
  };
  return labels[sentiment];
};
