import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { ELECTRICAL_MANAGEMENT_GATEWAY_PREFIX } from "@ghcloud/cube-service-interface/electrical-safety";
import type { ElectricalSafetyGateway } from "@ghcloud/cube-service-interface/electrical-safety";

import { useAuthRequest } from "./auth-request";
import {
  sendElectricalSafetyBlob,
  sendElectricalSafetyJson,
  sendElectricalSafetyOptionalJson,
  sendElectricalSafetyVoid,
} from "./electrical-safety-request";

const baseURL = ELECTRICAL_MANAGEMENT_GATEWAY_PREFIX;
const deviceCenterBaseURL = "/api/device-center";
const securityBaseURL = "/api/securitymanagement";
const encodeId = (id: string | number): string => encodeURIComponent(String(id));

export const listBusinessDictionaryItems: ElectricalSafetyGateway["listBusinessDictionaryItems"] = async (dictType) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({
        url: `${baseURL}/business-dictionaries/${encodeURIComponent(dictType)}/items`,
      }),
    ),
  );

export const getHomeFacilityOverviews: ElectricalSafetyGateway["getHomeFacilityOverviews"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/home/facility-overviews` })));

export const getDeviceOnlineRate: ElectricalSafetyGateway["getDeviceOnlineRate"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/home/statistics/device-online-rate` })));

export const getDeviceHealthDistribution: ElectricalSafetyGateway["getDeviceHealthDistribution"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/home/statistics/device-health-distribution` })));

export const getSafetyScore: ElectricalSafetyGateway["getSafetyScore"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/home/statistics/safety-score` })));

export const getMonthlyLineLoss: ElectricalSafetyGateway["getMonthlyLineLoss"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${securityBaseURL}/lineLoss/stat/month` })));

export const listFacilities: ElectricalSafetyGateway["listFacilities"] = async (params) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeListRequest({ url: `${baseURL}/facilities`, payload: { ...params } })));

export const getFacility: ElectricalSafetyGateway["getFacility"] = async (id) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/facilities/${encodeId(id)}` })));

export const createFacility: ElectricalSafetyGateway["createFacility"] = async (payload) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeCreateRequest({ url: `${baseURL}/facilities`, payload: { ...payload } })));

export const updateFacility: ElectricalSafetyGateway["updateFacility"] = async (id, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(
      makeUpdateRequest({
        url: `${baseURL}/facilities/${encodeId(id)}`,
        payload: { ...payload },
      }),
    ),
  );

export const deleteFacility: ElectricalSafetyGateway["deleteFacility"] = async (id) =>
  useAuthRequest(() => sendElectricalSafetyVoid(makeDELETERequest({ url: `${baseURL}/facilities/${encodeId(id)}` })));

export const listFacilityDevices: ElectricalSafetyGateway["listFacilityDevices"] = async (facilityId, deviceKind) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({
        url: `${baseURL}/facilities/${encodeId(facilityId)}/devices`,
        payload: { deviceKind },
      }),
    ),
  );

export const associateFacilityDevices: ElectricalSafetyGateway["associateFacilityDevices"] = async (facilityId, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(
      makeCreateRequest({
        url: `${baseURL}/facilities/${encodeId(facilityId)}/devices`,
        payload: { ...payload },
      }),
    ),
  );

export const removeFacilityDevice: ElectricalSafetyGateway["removeFacilityDevice"] = async (facilityId, deviceId) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(makeDELETERequest({ url: `${baseURL}/facilities/${encodeId(facilityId)}/devices/${encodeId(deviceId)}` })),
  );

export const listElectricalDeviceTypeParameterConfigs: ElectricalSafetyGateway["listElectricalDeviceTypeParameterConfigs"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/device-parameter-configs` })));

export const getDeviceConfig: ElectricalSafetyGateway["getDeviceConfig"] = async (facilityId, deviceId) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/facilities/${encodeId(facilityId)}/devices/${encodeId(deviceId)}/config` })),
  );

export const saveDeviceConfig: ElectricalSafetyGateway["saveDeviceConfig"] = async (facilityId, deviceId, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(
      makeUpdateRequest({
        url: `${baseURL}/facilities/${encodeId(facilityId)}/devices/${encodeId(deviceId)}/config`,
        payload: { ...payload },
      }),
    ),
  );

export const getEnvironmentDeviceParameterConfig: ElectricalSafetyGateway["getEnvironmentDeviceParameterConfig"] = async (
  facilityId,
  deviceId,
) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({
        url: `${baseURL}/facilities/${encodeId(facilityId)}/devices/${encodeId(deviceId)}/environment-parameter-config`,
      }),
    ),
  );

export const saveEnvironmentDeviceParameterConfig: ElectricalSafetyGateway["saveEnvironmentDeviceParameterConfig"] = async (
  facilityId,
  deviceId,
  payload,
) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(
      makeUpdateRequest({
        url: `${baseURL}/facilities/${encodeId(facilityId)}/devices/${encodeId(deviceId)}/environment-parameter-config`,
        payload: { ...payload },
      }),
    ),
  );

export const listMonitoringFacilities: ElectricalSafetyGateway["listMonitoringFacilities"] = async (params) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeListRequest({ url: `${baseURL}/monitoring/facilities`, payload: { ...params } })));

export const getMonitoringOverview: ElectricalSafetyGateway["getMonitoringOverview"] = async (facilityId) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/overview` })),
  );

export const listMonitoringDevices: ElectricalSafetyGateway["listMonitoringDevices"] = async (facilityId, params) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({ url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/devices`, payload: { ...params } }),
    ),
  );

export const getMonitoringDevice: ElectricalSafetyGateway["getMonitoringDevice"] = async (deviceId) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}` })));

export const getDeviceRealtimeProperties: ElectricalSafetyGateway["getDeviceRealtimeProperties"] = async (deviceId) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/realtime-properties` })),
  );

export const controlDeviceProperty: ElectricalSafetyGateway["controlDeviceProperty"] = async (deviceId, propertyCode, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeCreateRequest({
        url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/properties/${encodeURIComponent(propertyCode)}:control`,
        payload: { ...payload },
      }),
    ),
  );

export const listDeviceControlRecords: ElectricalSafetyGateway["listDeviceControlRecords"] = async (deviceId, params) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeListRequest({ url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/control-records`, payload: { ...params } }),
    ),
  );

export const listDeviceAlarmRecords: ElectricalSafetyGateway["listDeviceAlarmRecords"] = async (deviceId, params) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeListRequest({ url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/alarm-records`, payload: { ...params } }),
    ),
  );

export const listDeviceMaintenanceRecords: ElectricalSafetyGateway["listDeviceMaintenanceRecords"] = async (deviceId, params) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeListRequest({ url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/maintenance-records`, payload: { ...params } }),
    ),
  );

export const invokeDeviceMethod: ElectricalSafetyGateway["invokeDeviceMethod"] = async (deviceId, methodCode, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeCreateRequest({
        url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/methods/${encodeURIComponent(methodCode)}:invoke`,
        payload: { ...payload },
      }),
    ),
  );

export const getDeviceAiAnalysis: ElectricalSafetyGateway["getDeviceAiAnalysis"] = async (deviceId) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/monitoring/devices/${encodeId(deviceId)}/analysis` })));

export const listConfigurableProducts: ElectricalSafetyGateway["listConfigurableProducts"] = async (facilityId) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({
        url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/card-configs/products`,
      }),
    ),
  );

export const listProductCategoryTree: ElectricalSafetyGateway["listProductCategoryTree"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${deviceCenterBaseURL}/iot/product/category-tree` })));

export const listProductsByCategory: ElectricalSafetyGateway["listProductsByCategory"] = async (categoryCode) =>
  useAuthRequest(async () => {
    const products = await sendElectricalSafetyJson<{ id: string | number; name: string }[]>(
      makeGETRequest({ url: `${deviceCenterBaseURL}/category/${encodeURIComponent(categoryCode)}/product/list` }),
    );
    return products.map((product) => ({ productCode: String(product.id), productName: product.name }));
  });

export const listProductProperties: ElectricalSafetyGateway["listProductProperties"] = async (productCode) =>
  useAuthRequest(async () => {
    const properties = await sendElectricalSafetyJson<{ propCode?: string; name?: string; unitName?: string | null }[]>(
      makeGETRequest({ url: `${deviceCenterBaseURL}/things/product-prop/list`, payload: { prodId: productCode } }),
    );
    return properties.flatMap((property) =>
      property.propCode && property.name
        ? [{ propertyCode: property.propCode, propertyName: property.name, unit: property.unitName ?? null }]
        : [],
    );
  });

export const getDeviceCardConfig: ElectricalSafetyGateway["getDeviceCardConfig"] = async (facilityId, productCode) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({
        url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/card-configs/products/${encodeURIComponent(productCode)}`,
      }),
    ),
  );

export const saveDeviceCardConfig: ElectricalSafetyGateway["saveDeviceCardConfig"] = async (facilityId, productCode, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeUpdateRequest({
        url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/card-configs/products/${encodeURIComponent(productCode)}`,
        payload: { ...payload },
      }),
    ),
  );

export const getMonitorPanelConfig: ElectricalSafetyGateway["getMonitorPanelConfig"] = async (facilityId) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/panel-config` })),
  );

export const saveMonitorPanelConfig: ElectricalSafetyGateway["saveMonitorPanelConfig"] = async (facilityId, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeUpdateRequest({ url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/panel-config`, payload: { ...payload } }),
    ),
  );

export const getElectricalCenterScadaBinding: ElectricalSafetyGateway["getElectricalCenterScadaBinding"] = async () =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/monitoring/scada-binding` })));

export const saveElectricalCenterScadaBinding: ElectricalSafetyGateway["saveElectricalCenterScadaBinding"] = async (payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(
      makeUpdateRequest({
        url: `${baseURL}/monitoring/scada-binding`,
        payload: { ...payload },
      }),
    ),
  );

export const deleteElectricalCenterScadaBinding: ElectricalSafetyGateway["deleteElectricalCenterScadaBinding"] = async () =>
  useAuthRequest(() => sendElectricalSafetyVoid(makeDELETERequest({ url: `${baseURL}/monitoring/scada-binding` })));

export const getFacilityScadaBinding: ElectricalSafetyGateway["getFacilityScadaBinding"] = async (facilityId) =>
  useAuthRequest(() =>
    sendElectricalSafetyOptionalJson(
      makeGETRequest({
        url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/scada-binding`,
        showErrorMessage: false,
      }),
    ),
  );

export const saveFacilityScadaBinding: ElectricalSafetyGateway["saveFacilityScadaBinding"] = async (facilityId, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(
      makeUpdateRequest({
        url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/scada-binding`,
        payload: { ...payload },
      }),
    ),
  );

export const deleteFacilityScadaBinding: ElectricalSafetyGateway["deleteFacilityScadaBinding"] = async (facilityId) =>
  useAuthRequest(() =>
    sendElectricalSafetyVoid(makeDELETERequest({ url: `${baseURL}/monitoring/facilities/${encodeId(facilityId)}/scada-binding` })),
  );

export const listRemoteInspectionTemplates: ElectricalSafetyGateway["listRemoteInspectionTemplates"] = async (params) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeListRequest({ url: `${baseURL}/remote-inspection/templates`, payload: { ...params } })),
  );

export const getRemoteInspectionTemplate: ElectricalSafetyGateway["getRemoteInspectionTemplate"] = async (id) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeGETRequest({ url: `${baseURL}/remote-inspection/templates/${encodeId(id)}` })));

export const createRemoteInspectionTemplate: ElectricalSafetyGateway["createRemoteInspectionTemplate"] = async (payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeCreateRequest({ url: `${baseURL}/remote-inspection/templates`, payload: { ...payload } })),
  );

export const updateRemoteInspectionTemplate: ElectricalSafetyGateway["updateRemoteInspectionTemplate"] = async (id, payload) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(makeUpdateRequest({ url: `${baseURL}/remote-inspection/templates/${encodeId(id)}`, payload: { ...payload } })),
  );

export const deleteRemoteInspectionTemplate: ElectricalSafetyGateway["deleteRemoteInspectionTemplate"] = async (id) =>
  useAuthRequest(() => sendElectricalSafetyJson(makeDELETERequest({ url: `${baseURL}/remote-inspection/templates/${encodeId(id)}` })));

export const updateRemoteInspectionTemplateEnabled: ElectricalSafetyGateway["updateRemoteInspectionTemplateEnabled"] = async (
  id,
  payload,
) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeUpdateRequest({ url: `${baseURL}/remote-inspection/templates/${encodeId(id)}/enabled`, payload: { ...payload } }),
    ),
  );

export const getRemoteInspectionData: ElectricalSafetyGateway["getRemoteInspectionData"] = async (id, params) =>
  useAuthRequest(() =>
    sendElectricalSafetyJson(
      makeGETRequest({ url: `${baseURL}/remote-inspection/templates/${encodeId(id)}/data`, payload: { ...params } }),
    ),
  );

export const exportRemoteInspectionData: ElectricalSafetyGateway["exportRemoteInspectionData"] = async (id, params) =>
  useAuthRequest(() =>
    sendElectricalSafetyBlob(
      makeGETRequest({ url: `${baseURL}/remote-inspection/templates/${encodeId(id)}/data/export`, payload: { ...params } }),
    ),
  );
