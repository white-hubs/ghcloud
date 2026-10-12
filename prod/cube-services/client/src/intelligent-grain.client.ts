import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type { IntelligentGrainGateway } from "@ghcloud/cube-service-interface/intelligent-grain";

import { sendIntelligentGrainBlob, sendIntelligentGrainJson, sendIntelligentGrainVoid } from "./intelligent-grain-request";

const INTELLIGENT_GRAIN_API = `${BASE_API}/intelligent-grain`;

export const getIntelligentGrainDashboard: IntelligentGrainGateway["getIntelligentGrainDashboard"] = async (params) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/dashboard/overview`, payload: { ...params } }));
};

export const listIntelligentGrainWarehouseOptions: IntelligentGrainGateway["listIntelligentGrainWarehouseOptions"] = async (params) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses/options`, payload: { ...params } }));
};

export const pageIntelligentGrainWarehouses: IntelligentGrainGateway["pageIntelligentGrainWarehouses"] = async (params) => {
  return sendIntelligentGrainJson(makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses/page`, payload: { ...params } }));
};

export const getIntelligentGrainWarehouse: IntelligentGrainGateway["getIntelligentGrainWarehouse"] = async (warehouseId) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses/${warehouseId}` }));
};

export const createIntelligentGrainWarehouse: IntelligentGrainGateway["createIntelligentGrainWarehouse"] = async (payload) => {
  return sendIntelligentGrainJson(makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses`, payload: { ...payload } }));
};

export const updateIntelligentGrainWarehouse: IntelligentGrainGateway["updateIntelligentGrainWarehouse"] = async (warehouseId, payload) => {
  return sendIntelligentGrainJson(
    makeUpdateRequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses/${warehouseId}`, payload: { ...payload } }),
  );
};

export const deleteIntelligentGrainWarehouse: IntelligentGrainGateway["deleteIntelligentGrainWarehouse"] = async (warehouseId) => {
  return sendIntelligentGrainVoid(makeDELETERequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses/${warehouseId}` }));
};

export const listIntelligentGrainVarietyOptions: IntelligentGrainGateway["listIntelligentGrainVarietyOptions"] = async (warehouseId) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/warehouses/${warehouseId}/grain-varieties/options` }));
};

export const listIntelligentGrainGlobalVarietyOptions: IntelligentGrainGateway["listIntelligentGrainGlobalVarietyOptions"] = async (
  params,
) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties/options`, payload: { ...params } }));
};

export const pageIntelligentGrainVarieties: IntelligentGrainGateway["pageIntelligentGrainVarieties"] = async (params) => {
  return sendIntelligentGrainJson(makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties/page`, payload: { ...params } }));
};

export const getIntelligentGrainVariety: IntelligentGrainGateway["getIntelligentGrainVariety"] = async (varietyId) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties/${varietyId}` }));
};

export const createIntelligentGrainVariety: IntelligentGrainGateway["createIntelligentGrainVariety"] = async (payload) => {
  return sendIntelligentGrainJson(makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties`, payload: { ...payload } }));
};

export const updateIntelligentGrainVariety: IntelligentGrainGateway["updateIntelligentGrainVariety"] = async (varietyId, payload) => {
  return sendIntelligentGrainJson(
    makeUpdateRequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties/${varietyId}`, payload: { ...payload } }),
  );
};

export const deleteIntelligentGrainVariety: IntelligentGrainGateway["deleteIntelligentGrainVariety"] = async (varietyId) => {
  return sendIntelligentGrainVoid(makeDELETERequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties/${varietyId}` }));
};

export const exportIntelligentGrainVarieties: IntelligentGrainGateway["exportIntelligentGrainVarieties"] = async (params) => {
  return sendIntelligentGrainBlob(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/grain-varieties/export`, payload: { ...params } }));
};

export const pageIntelligentGrainQualityRecords: IntelligentGrainGateway["pageIntelligentGrainQualityRecords"] = async (params) => {
  return sendIntelligentGrainJson(makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/quality-records/page`, payload: { ...params } }));
};

export const getIntelligentGrainQualityRecord: IntelligentGrainGateway["getIntelligentGrainQualityRecord"] = async (recordId) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/quality-records/${recordId}` }));
};

export const createIntelligentGrainQualityRecord: IntelligentGrainGateway["createIntelligentGrainQualityRecord"] = async (payload) => {
  return sendIntelligentGrainJson(makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/quality-records`, payload: { ...payload } }));
};

export const updateIntelligentGrainQualityRecord: IntelligentGrainGateway["updateIntelligentGrainQualityRecord"] = async (
  recordId,
  payload,
) => {
  return sendIntelligentGrainJson(
    makeUpdateRequest({ url: `${INTELLIGENT_GRAIN_API}/quality-records/${recordId}`, payload: { ...payload } }),
  );
};

export const deleteIntelligentGrainQualityRecord: IntelligentGrainGateway["deleteIntelligentGrainQualityRecord"] = async (recordId) => {
  return sendIntelligentGrainVoid(makeDELETERequest({ url: `${INTELLIGENT_GRAIN_API}/quality-records/${recordId}` }));
};

export const exportIntelligentGrainQualityRecords: IntelligentGrainGateway["exportIntelligentGrainQualityRecords"] = async (params) => {
  return sendIntelligentGrainBlob(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/quality-records/export`, payload: { ...params } }));
};

export const getIntelligentGrainArchive: IntelligentGrainGateway["getIntelligentGrainArchive"] = async (warehouseId) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/grain/archives/${warehouseId}` }));
};

export const getIntelligentGrainArchiveTrend: IntelligentGrainGateway["getIntelligentGrainArchiveTrend"] = async (warehouseId, params) => {
  return sendIntelligentGrainJson(
    makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/archives/${warehouseId}/trend`, payload: { ...params } }),
  );
};

export const pageIntelligentGrainArchiveRecords: IntelligentGrainGateway["pageIntelligentGrainArchiveRecords"] = async (
  warehouseId,
  params,
) => {
  return sendIntelligentGrainJson(
    makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/archives/${warehouseId}/records/page`, payload: { ...params } }),
  );
};

export const exportIntelligentGrainArchiveRecords: IntelligentGrainGateway["exportIntelligentGrainArchiveRecords"] = async (
  warehouseId,
  params,
) => {
  return sendIntelligentGrainBlob(
    makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/archives/${warehouseId}/records/export`, payload: { ...params } }),
  );
};

export const batchWriteIntelligentGrainMetricSamples: IntelligentGrainGateway["batchWriteIntelligentGrainMetricSamples"] = async (
  payload,
) => {
  return sendIntelligentGrainVoid(makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/metric-samples/batch`, payload: { ...payload } }));
};

export const getIntelligentGrainGlobalRules: IntelligentGrainGateway["getIntelligentGrainGlobalRules"] = async () => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/global` }));
};

export const saveIntelligentGrainGlobalRules: IntelligentGrainGateway["saveIntelligentGrainGlobalRules"] = async (payload) => {
  return sendIntelligentGrainVoid(makeUpdateRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/global`, payload: { ...payload } }));
};

export const restoreIntelligentGrainFactoryDefaults: IntelligentGrainGateway["restoreIntelligentGrainFactoryDefaults"] = async () => {
  return sendIntelligentGrainJson(makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/factory-defaults/restore`, payload: {} }));
};

export const pageIntelligentGrainWarehouseRules: IntelligentGrainGateway["pageIntelligentGrainWarehouseRules"] = async (params) => {
  return sendIntelligentGrainJson(makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/warehouses/page`, payload: { ...params } }));
};

export const getIntelligentGrainWarehouseRules: IntelligentGrainGateway["getIntelligentGrainWarehouseRules"] = async (warehouseId) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/warehouses/${warehouseId}` }));
};

export const saveIntelligentGrainWarehouseRules: IntelligentGrainGateway["saveIntelligentGrainWarehouseRules"] = async (
  warehouseId,
  payload,
) => {
  return sendIntelligentGrainVoid(
    makeUpdateRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/warehouses/${warehouseId}`, payload: { ...payload } }),
  );
};

export const deleteIntelligentGrainWarehouseRules: IntelligentGrainGateway["deleteIntelligentGrainWarehouseRules"] = async (
  warehouseId,
) => {
  return sendIntelligentGrainVoid(makeDELETERequest({ url: `${INTELLIGENT_GRAIN_API}/rules/warehouses/${warehouseId}` }));
};

export const getIntelligentGrainRuleEngineConstants: IntelligentGrainGateway["getIntelligentGrainRuleEngineConstants"] = async () => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/rules/engine-constants` }));
};

export const pageIntelligentGrainAlerts: IntelligentGrainGateway["pageIntelligentGrainAlerts"] = async (params) => {
  return sendIntelligentGrainJson(makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/page`, payload: { ...params } }));
};

export const getIntelligentGrainAlert: IntelligentGrainGateway["getIntelligentGrainAlert"] = async (id) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}` }));
};

export const getIntelligentGrainAlertTracking: IntelligentGrainGateway["getIntelligentGrainAlertTracking"] = async (id) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/tracking` }));
};

export const judgeIntelligentGrainAlertReal: IntelligentGrainGateway["judgeIntelligentGrainAlertReal"] = async (id, payload) => {
  return sendIntelligentGrainVoid(
    makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/judgement/real`, payload: { ...payload } }),
  );
};

export const markIntelligentGrainAlertMistake: IntelligentGrainGateway["markIntelligentGrainAlertMistake"] = async (id, payload) => {
  return sendIntelligentGrainVoid(
    makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/judgement/mistake`, payload: { ...payload } }),
  );
};

export const saveIntelligentGrainDisposalDraft: IntelligentGrainGateway["saveIntelligentGrainDisposalDraft"] = async (id, payload) => {
  return sendIntelligentGrainVoid(
    makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/disposal/draft`, payload: { ...payload } }),
  );
};

export const submitIntelligentGrainDisposal: IntelligentGrainGateway["submitIntelligentGrainDisposal"] = async (id, payload) => {
  return sendIntelligentGrainVoid(
    makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/disposal/submit`, payload: { ...payload } }),
  );
};

export const acceptIntelligentGrainAlert: IntelligentGrainGateway["acceptIntelligentGrainAlert"] = async (id, payload) => {
  return sendIntelligentGrainVoid(
    makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/acceptance/pass`, payload: { ...payload } }),
  );
};

export const rejectIntelligentGrainAlert: IntelligentGrainGateway["rejectIntelligentGrainAlert"] = async (id, payload) => {
  return sendIntelligentGrainVoid(
    makeCreateRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/${id}/acceptance/reject`, payload: { ...payload } }),
  );
};

export const exportIntelligentGrainAlerts: IntelligentGrainGateway["exportIntelligentGrainAlerts"] = async (params) => {
  return sendIntelligentGrainBlob(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/alerts/export`, payload: { ...params } }));
};

export const getIntelligentGrainMobileSummary: IntelligentGrainGateway["getIntelligentGrainMobileSummary"] = async (params) => {
  return sendIntelligentGrainJson(makeGETRequest({ url: `${INTELLIGENT_GRAIN_API}/mobile/summary`, payload: { ...params } }));
};

export const pageMyIntelligentGrainAlerts: IntelligentGrainGateway["pageMyIntelligentGrainAlerts"] = async (params) => {
  return sendIntelligentGrainJson(makeListRequest({ url: `${INTELLIGENT_GRAIN_API}/mobile/my-alerts`, payload: { ...params } }));
};
