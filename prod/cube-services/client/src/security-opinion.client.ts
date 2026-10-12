import {
  makeCreateRequest,
  makeCustomRequest,
  makeDELETERequest,
  makeGETRequest,
  makeListRequest,
  makeUpdateRequest,
} from "@ghcloud/cube-gateway";
import type { Pagination } from "@ghcloud/cube-service-interface/base";
import type { SecurityOpinionGateway } from "@ghcloud/cube-service-interface/security-opinion";

import {
  fromBackendHotEvents,
  fromBackendAlert,
  fromBackendAlertChannel,
  fromBackendAlertReceiver,
  fromBackendAlertEvent,
  fromBackendKeyword,
  fromBackendKeywordPresets,
  fromBackendKeywordRank,
  fromBackendKeywordRule,
  fromBackendNotificationConfig,
  fromBackendOpinionDetail,
  fromBackendOpinionPage,
  fromBackendOverview,
  fromBackendPushRecord,
  fromBackendReviewReport,
  fromBackendSentimentChart,
  fromBackendSource,
  fromBackendSourceChart,
  fromBackendTrash,
  fromBackendTrendChart,
  mapAlertPageParams,
  mapAlertReceiverPageParams,
  mapOpinionPageParams,
  mapPagination,
  mapReviewReportPageParams,
  toBackendKeywordRule,
  toBackendKeywordType,
  toBackendSourcePayload,
} from "./security-opinion.mapper";

const BFF = "/gw-bff/security-opinion";

export const pageOpinions: SecurityOpinionGateway["pageOpinions"] = async (params) => {
  const resp = await makeListRequest({
    url: `${BFF}/opinions`,
    payload: mapOpinionPageParams(params),
  }).send();
  const raw = (await resp.json()) as Pagination<Record<string, unknown>>;
  return mapPagination(raw, fromBackendOpinionPage);
};

export const getOpinion: SecurityOpinionGateway["getOpinion"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/opinions/${id}` }).send();
  const raw = (await resp.json()) as Record<string, unknown>;
  return fromBackendOpinionDetail(raw);
};

export const exportOpinions: SecurityOpinionGateway["exportOpinions"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/opinions/export`,
    payload: mapOpinionPageParams({ pageNumber: 1, pageSize: 9999, ...params }),
  }).send();
  return resp.blob();
};

export const batchDeleteOpinions: SecurityOpinionGateway["batchDeleteOpinions"] = async (ids) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `${BFF}/opinions/batch-delete`,
    payload: ids,
  }).send();
  await resp.blob();
};

export const listSources: SecurityOpinionGateway["listSources"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/sources` }).send();
  const raw = (await resp.json()) as Record<string, unknown>[];
  return raw.map(fromBackendSource);
};

export const createSource: SecurityOpinionGateway["createSource"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/sources`,
    payload: toBackendSourcePayload(payload),
  }).send();
  const id = String((await resp.json()) as unknown);
  const detailResp = await makeGETRequest({ url: `${BFF}/sources/${id}` }).send();
  return fromBackendSource((await detailResp.json()) as Record<string, unknown>);
};

export const updateSource: SecurityOpinionGateway["updateSource"] = async (id, payload) => {
  await makeUpdateRequest({
    url: `${BFF}/sources/${id}`,
    payload: toBackendSourcePayload(payload),
  }).send();
  const detailResp = await makeGETRequest({ url: `${BFF}/sources/${id}` }).send();
  return fromBackendSource((await detailResp.json()) as Record<string, unknown>);
};

export const deleteSource: SecurityOpinionGateway["deleteSource"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/sources/${id}` }).send();
  await resp.blob();
};

export const pauseSource: SecurityOpinionGateway["pauseSource"] = async (id) => {
  const resp = await makeCreateRequest({ url: `${BFF}/sources/${id}/pause` }).send();
  await resp.blob();
};

export const resumeSource: SecurityOpinionGateway["resumeSource"] = async (id) => {
  const resp = await makeCreateRequest({ url: `${BFF}/sources/${id}/resume` }).send();
  await resp.blob();
};

export const getKeywordRule: SecurityOpinionGateway["getKeywordRule"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/keyword-rule` }).send();
  return fromBackendKeywordRule((await resp.json()) as Record<string, unknown>);
};

export const updateKeywordRule: SecurityOpinionGateway["updateKeywordRule"] = async (payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/keyword-rule`,
    payload: toBackendKeywordRule(payload),
  }).send();
  await resp.blob();
};

export const listKeywords: SecurityOpinionGateway["listKeywords"] = async (type) => {
  const resp = await makeGETRequest({
    url: `${BFF}/keywords`,
    payload: { type: toBackendKeywordType(type) },
  }).send();
  const raw = (await resp.json()) as Record<string, unknown>[];
  return raw.map(fromBackendKeyword);
};

export const addKeyword: SecurityOpinionGateway["addKeyword"] = async (type, keywordText) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/keywords`,
    payload: { type: toBackendKeywordType(type), keywordText },
  }).send();
  return fromBackendKeyword((await resp.json()) as Record<string, unknown>);
};

export const deleteKeyword: SecurityOpinionGateway["deleteKeyword"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/keywords/${id}` }).send();
  await resp.blob();
};

export const listKeywordPresets: SecurityOpinionGateway["listKeywordPresets"] = async (type) => {
  const resp = await makeGETRequest({
    url: `${BFF}/keyword-presets`,
    payload: { type: toBackendKeywordType(type) },
  }).send();
  return fromBackendKeywordPresets(await resp.json());
};

export const addKeywordFromPreset: SecurityOpinionGateway["addKeywordFromPreset"] = async (type, keywordText) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/keywords/presets`,
    payload: { type: toBackendKeywordType(type), keywordText },
  }).send();
  return fromBackendKeyword((await resp.json()) as Record<string, unknown>);
};

export const batchAddKeywordPresets: SecurityOpinionGateway["batchAddKeywordPresets"] = async (type) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/keywords/presets/batch?type=${encodeURIComponent(toBackendKeywordType(type))}`,
  }).send();
  const raw = (await resp.json()) as Record<string, unknown>[];
  return raw.map(fromBackendKeyword);
};

export const getStatisticsOverview: SecurityOpinionGateway["getStatisticsOverview"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/statistics/overview` }).send();
  return fromBackendOverview((await resp.json()) as Record<string, unknown>);
};

export const getSentimentDistribution: SecurityOpinionGateway["getSentimentDistribution"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/statistics/sentiment-distribution` }).send();
  return fromBackendSentimentChart((await resp.json()) as Record<string, unknown>[]);
};

export const getSourceDistribution: SecurityOpinionGateway["getSourceDistribution"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/statistics/source-distribution` }).send();
  return fromBackendSourceChart((await resp.json()) as Record<string, unknown>[]);
};

export const getCollectionTrend: SecurityOpinionGateway["getCollectionTrend"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/statistics/collect-trend` }).send();
  return fromBackendTrendChart((await resp.json()) as Record<string, unknown>[]);
};

export const getKeywordRanking: SecurityOpinionGateway["getKeywordRanking"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/statistics/keyword-rank` }).send();
  return fromBackendKeywordRank((await resp.json()) as Record<string, unknown>[]);
};

export const getHotEvents: SecurityOpinionGateway["getHotEvents"] = async (limit = 10) => {
  const resp = await makeGETRequest({
    url: `${BFF}/statistics/hot-events`,
    payload: { limit },
  }).send();
  return fromBackendHotEvents((await resp.json()) as Record<string, unknown>[]);
};

export const pageTrash: SecurityOpinionGateway["pageTrash"] = async (params) => {
  const resp = await makeListRequest({
    url: `${BFF}/recycle-bin`,
    payload: { ...params },
  }).send();
  const raw = (await resp.json()) as Pagination<Record<string, unknown>>;
  return mapPagination(raw, fromBackendTrash);
};

export const getTrashItem: SecurityOpinionGateway["getTrashItem"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/recycle-bin/${id}` }).send();
  return fromBackendTrash((await resp.json()) as Record<string, unknown>);
};

export const restoreTrashItem: SecurityOpinionGateway["restoreTrashItem"] = async (id) => {
  const resp = await makeCreateRequest({ url: `${BFF}/recycle-bin/${id}/restore` }).send();
  await resp.blob();
};

export const deleteTrashItem: SecurityOpinionGateway["deleteTrashItem"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/recycle-bin/${id}` }).send();
  await resp.blob();
};

export const clearTrash: SecurityOpinionGateway["clearTrash"] = async () => {
  const resp = await makeDELETERequest({ url: `${BFF}/recycle-bin` }).send();
  await resp.blob();
};

export const pageAlerts: SecurityOpinionGateway["pageAlerts"] = async (params) => {
  const resp = await makeListRequest({
    url: `${BFF}/alerts`,
    payload: mapAlertPageParams(params),
  }).send();
  const raw = (await resp.json()) as Pagination<Record<string, unknown>>;
  return mapPagination(raw, fromBackendAlert);
};

export const getAlert: SecurityOpinionGateway["getAlert"] = async (opinionId) => {
  const resp = await makeGETRequest({ url: `${BFF}/alerts/${opinionId}` }).send();
  return fromBackendAlert((await resp.json()) as Record<string, unknown>);
};

export const listAlertChannels: SecurityOpinionGateway["listAlertChannels"] = async (sceneCode) => {
  const resp = await makeGETRequest({
    url: `${BFF}/alerts/channels`,
    payload: { sceneCode },
  }).send();
  const raw = (await resp.json()) as Record<string, unknown>[];
  return raw.map(fromBackendAlertChannel);
};

export const pageAlertReceivers: SecurityOpinionGateway["pageAlertReceivers"] = async (params) => {
  const resp = await makeListRequest({
    url: `${BFF}/alerts/receivers`,
    payload: mapAlertReceiverPageParams(params),
  }).send();
  const raw = (await resp.json()) as Pagination<Record<string, unknown>>;
  return mapPagination(raw, fromBackendAlertReceiver);
};

export const pushAlert: SecurityOpinionGateway["pushAlert"] = async (opinionId, payload = {}) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/alerts/${opinionId}/push`,
    payload: { ...payload },
  }).send();
  await resp.blob();
};

export const listAlertPushRecords: SecurityOpinionGateway["listAlertPushRecords"] = async (opinionId) => {
  const resp = await makeGETRequest({ url: `${BFF}/alerts/${opinionId}/push-records` }).send();
  const raw = (await resp.json()) as Record<string, unknown>[];
  return raw.map(fromBackendPushRecord);
};

export const getAlertEvent: SecurityOpinionGateway["getAlertEvent"] = async (eventId) => {
  const resp = await makeGETRequest({ url: `${BFF}/alerts/events/${eventId}` }).send();
  return fromBackendAlertEvent((await resp.json()) as Record<string, unknown>);
};

export const archiveAlertEvent: SecurityOpinionGateway["archiveAlertEvent"] = async (eventId, payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/alerts/events/${eventId}/archive`,
    payload: { ...payload },
  }).send();
  await resp.blob();
};

export const getAlertNotificationConfig: SecurityOpinionGateway["getAlertNotificationConfig"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/alerts/notification-config` }).send();
  return fromBackendNotificationConfig((await resp.json()) as Record<string, unknown>);
};

export const saveAlertNotificationConfig: SecurityOpinionGateway["saveAlertNotificationConfig"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/alerts/notification-config`,
    payload: { ...payload },
  }).send();
  await resp.blob();
};

export const pageReviewReports: SecurityOpinionGateway["pageReviewReports"] = async (params) => {
  const resp = await makeListRequest({
    url: `${BFF}/review-reports`,
    payload: mapReviewReportPageParams(params),
  }).send();
  const raw = (await resp.json()) as Pagination<Record<string, unknown>>;
  return mapPagination(raw, fromBackendReviewReport);
};

export const getReviewReportEvent: SecurityOpinionGateway["getReviewReportEvent"] = async (eventId) => {
  const resp = await makeGETRequest({ url: `${BFF}/review-reports/events/${eventId}` }).send();
  return fromBackendReviewReport((await resp.json()) as Record<string, unknown>);
};

export const generateReviewReport: SecurityOpinionGateway["generateReviewReport"] = async (eventId) => {
  const resp = await makeCreateRequest({ url: `${BFF}/review-reports/events/${eventId}/generate` }).send();
  return fromBackendReviewReport((await resp.json()) as Record<string, unknown>);
};

export const saveReviewReportDraft: SecurityOpinionGateway["saveReviewReportDraft"] = async (reportId, payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/review-reports/${reportId}/draft`,
    payload: { ...payload },
  }).send();
  await resp.blob();
};

export const finalizeReviewReport: SecurityOpinionGateway["finalizeReviewReport"] = async (reportId) => {
  const resp = await makeCreateRequest({ url: `${BFF}/review-reports/${reportId}/finalize` }).send();
  await resp.blob();
};
