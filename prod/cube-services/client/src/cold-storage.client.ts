import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type { ColdStorageGateway } from "@ghcloud/cube-service-interface/cold-storage";

import { sendColdStorageJson, sendColdStorageVoid } from "./cold-storage-request";

const COLD_STORAGE_API = `${BASE_API}/cold-storage`;

export const getColdStorePage: ColdStorageGateway["getColdStorePage"] = async (query) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores`, payload: { ...query } }));
};

export const getColdStoreDetail: ColdStorageGateway["getColdStoreDetail"] = async (id) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/${id}` }));
};

export const saveColdStore: ColdStorageGateway["saveColdStore"] = async (payload, id) => {
  if (id == null) {
    await sendColdStorageJson<string>(makeCreateRequest({ url: `${COLD_STORAGE_API}/stores`, payload: { ...payload } }));
    return;
  }
  await sendColdStorageVoid(makeUpdateRequest({ url: `${COLD_STORAGE_API}/stores/${id}`, payload: { ...payload } }));
};

export const deleteColdStore: ColdStorageGateway["deleteColdStore"] = async (id) => {
  await sendColdStorageVoid(makeDELETERequest({ url: `${COLD_STORAGE_API}/stores/${id}` }));
};

export const getColdStoreMonitorExceptionStatistics: ColdStorageGateway["getColdStoreMonitorExceptionStatistics"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/monitor/exception-statistics` }));
};

export const getColdStoreMonitorCards: ColdStorageGateway["getColdStoreMonitorCards"] = async (query) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/monitor/cards`, payload: { ...query } }));
};

export const getColdStoreMonitorCardDetail: ColdStorageGateway["getColdStoreMonitorCardDetail"] = async (id) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/monitor/cards/${id}` }));
};

export const getColdStoreInsideDoorStatuses: ColdStorageGateway["getColdStoreInsideDoorStatuses"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/inside/door-statuses` }));
};

export const getColdStoreInsideDoorDetail: ColdStorageGateway["getColdStoreInsideDoorDetail"] = async (storeId) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/inside/door-statuses/${storeId}` }));
};

export const getColdStoreInsideTemperatureOverview: ColdStorageGateway["getColdStoreInsideTemperatureOverview"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/inside/temperature-overview` }));
};

export const getColdStoreRefrigerationHealthOverview: ColdStorageGateway["getColdStoreRefrigerationHealthOverview"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/refrigeration/health-overview` }));
};

export const getColdStoreRefrigerationUnitDetail: ColdStorageGateway["getColdStoreRefrigerationUnitDetail"] = async (unitCode) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/refrigeration/units/${unitCode}` }));
};

export const getColdStoreRefrigerationEnergy: ColdStorageGateway["getColdStoreRefrigerationEnergy"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/refrigeration/energy` }));
};

export const getColdStoreLeakResponses: ColdStorageGateway["getColdStoreLeakResponses"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/leak-responses` }));
};

export const getColdStoreLeakResponseDetail: ColdStorageGateway["getColdStoreLeakResponseDetail"] = async (alarmId) => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/leak-responses/${alarmId}` }));
};

export const getColdStoreStatisticsPreview: ColdStorageGateway["getColdStoreStatisticsPreview"] = async () => {
  return sendColdStorageJson(makeGETRequest({ url: `${COLD_STORAGE_API}/stores/statistics/preview` }));
};
