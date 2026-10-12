import { makeCreateRequest, makeCustomRequest, makeDELETERequest, makeGETRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type { EmergencySuppliesGateway } from "@ghcloud/cube-service-interface/emergency-supplies";

import { useAuthRequest } from "./auth-request";

const BFF = "/gw-bff/emergency-supplies";
// 导入走业务接口直连（不经 BFF 代理），沿用旧接口 /api/emergency 前缀
const BUSINESS_API = `${BASE_API}/emergency`;

const json = async <T>(request: ReturnType<typeof makeGETRequest>): Promise<T> => {
  const resp = await request.send();
  return resp.json();
};

const empty = async (request: ReturnType<typeof makeGETRequest>): Promise<void> => {
  const resp = await request.send();
  await resp.blob();
};

export const getWarehousePage: EmergencySuppliesGateway["getWarehousePage"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/warehouses/page`, payload: { ...payload } })));

export const getWarehouseDetail: EmergencySuppliesGateway["getWarehouseDetail"] = async (id) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/warehouses/${id}` })));

export const createWarehouse: EmergencySuppliesGateway["createWarehouse"] = async (payload) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/warehouses`, payload: { ...payload } })));

export const updateWarehouse: EmergencySuppliesGateway["updateWarehouse"] = async (id, payload) =>
  useAuthRequest(() => empty(makeUpdateRequest({ url: `${BFF}/warehouses/${id}`, payload: { ...payload } })));

export const changeWarehouseStatus: EmergencySuppliesGateway["changeWarehouseStatus"] = async (id, status) =>
  useAuthRequest(() =>
    empty(
      makeCustomRequest({
        method: "PUT",
        url: `${BFF}/warehouses/${id}/status`,
        query: { status },
      }),
    ),
  );

export const deleteWarehouse: EmergencySuppliesGateway["deleteWarehouse"] = async (id) =>
  useAuthRequest(() => empty(makeDELETERequest({ url: `${BFF}/warehouses/${id}` })));

export const getSuppliesTypePage: EmergencySuppliesGateway["getSuppliesTypePage"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/supplies-types/page`, payload: { ...payload } })));

export const createSuppliesType: EmergencySuppliesGateway["createSuppliesType"] = async (payload) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/supplies-types`, payload: { ...payload } })));

export const updateSuppliesType: EmergencySuppliesGateway["updateSuppliesType"] = async (id, payload) =>
  useAuthRequest(() => empty(makeUpdateRequest({ url: `${BFF}/supplies-types/${id}`, payload: { ...payload } })));

export const deleteSuppliesType: EmergencySuppliesGateway["deleteSuppliesType"] = async (id) =>
  useAuthRequest(() => empty(makeDELETERequest({ url: `${BFF}/supplies-types/${id}` })));

export const getSuppliesPage: EmergencySuppliesGateway["getSuppliesPage"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/supplies/page`, payload: { ...payload } })));

export const getSuppliesDetail: EmergencySuppliesGateway["getSuppliesDetail"] = async (id) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/supplies/${id}` })));

export const getSuppliesOverview: EmergencySuppliesGateway["getSuppliesOverview"] = async () =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/supplies/overview` })));

export const createSupplies: EmergencySuppliesGateway["createSupplies"] = async (payload) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/supplies`, payload: { ...payload } })));

export const updateSupplies: EmergencySuppliesGateway["updateSupplies"] = async (id, payload) =>
  useAuthRequest(() => empty(makeUpdateRequest({ url: `${BFF}/supplies/${id}`, payload: { ...payload } })));

export const changeSuppliesStatus: EmergencySuppliesGateway["changeSuppliesStatus"] = async (id, status) =>
  useAuthRequest(() =>
    empty(
      makeCustomRequest({
        method: "PUT",
        url: `${BFF}/supplies/${id}/status`,
        query: { status },
      }),
    ),
  );

export const exportSuppliesLedger: EmergencySuppliesGateway["exportSuppliesLedger"] = async (payload) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/supplies/export`, payload: { ...payload } }).send();
    return resp.blob();
  });

export const downloadSuppliesImportTemplate: EmergencySuppliesGateway["downloadSuppliesImportTemplate"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/supplies/import-template` }).send();
    return resp.blob();
  });

export const importSuppliesLedger: EmergencySuppliesGateway["importSuppliesLedger"] = async (file) =>
  useAuthRequest(() => {
    const formData = new FormData();
    formData.append("file", file);
    return empty(
      makeCreateRequest({
        url: `${BUSINESS_API}/emergency-supplies/import`,
        payload: formData as unknown as Record<string, unknown>,
      }),
    );
  });

export const createSuppliesBatch: EmergencySuppliesGateway["createSuppliesBatch"] = async (id, payload) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/supplies/${id}/batches`, payload: { ...payload } })));

export const getSuppliesBatches: EmergencySuppliesGateway["getSuppliesBatches"] = async (id) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/supplies/${id}/batches` })));

export const getDispatchOrderPage: EmergencySuppliesGateway["getDispatchOrderPage"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/dispatch-orders/page`, payload: { ...payload } })));

export const getDispatchOrderDetail: EmergencySuppliesGateway["getDispatchOrderDetail"] = async (id) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/dispatch-orders/${id}` })));

export const createDispatchOrder: EmergencySuppliesGateway["createDispatchOrder"] = async (payload) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/dispatch-orders`, payload: { ...payload } })));

export const getDispatchStat: EmergencySuppliesGateway["getDispatchStat"] = async () =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/dispatch-orders/stat` })));

export const confirmDispatchOutbound: EmergencySuppliesGateway["confirmDispatchOutbound"] = async (id, payload) =>
  useAuthRequest(() => empty(makeUpdateRequest({ url: `${BFF}/dispatch-orders/${id}/confirm-outbound`, payload: { ...(payload ?? {}) } })));

export const confirmDispatchUsing: EmergencySuppliesGateway["confirmDispatchUsing"] = async (id) =>
  useAuthRequest(() => empty(makeUpdateRequest({ url: `${BFF}/dispatch-orders/${id}/confirm-using`, payload: {} })));

export const cancelDispatchOrder: EmergencySuppliesGateway["cancelDispatchOrder"] = async (id) =>
  useAuthRequest(() => empty(makeUpdateRequest({ url: `${BFF}/dispatch-orders/${id}/cancel`, payload: {} })));

export const returnDispatchItem: EmergencySuppliesGateway["returnDispatchItem"] = async (id, payload) =>
  useAuthRequest(() => empty(makeCreateRequest({ url: `${BFF}/dispatch-items/${id}/return`, payload: { ...payload } })));

export const writeoffDispatchItem: EmergencySuppliesGateway["writeoffDispatchItem"] = async (id, payload) =>
  useAuthRequest(() => empty(makeCreateRequest({ url: `${BFF}/dispatch-items/${id}/writeoff`, payload: { ...payload } })));

export const getWarningConfig: EmergencySuppliesGateway["getWarningConfig"] = async () =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/warning-config` })));

export const updateWarningConfig: EmergencySuppliesGateway["updateWarningConfig"] = async (payload) =>
  useAuthRequest(() =>
    empty(
      makeCustomRequest({
        method: "PUT",
        url: `${BFF}/warning-config`,
        payload: payload.map((item) => ({ ...item })),
      }),
    ),
  );

export const getExpiryWarningPage: EmergencySuppliesGateway["getExpiryWarningPage"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/expiry-warnings/page`, payload: { ...payload } })));

export const getStockWarningPage: EmergencySuppliesGateway["getStockWarningPage"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/stock-warnings/page`, payload: { ...payload } })));

export const getSuppliesMapPoints: EmergencySuppliesGateway["getSuppliesMapPoints"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/map/points`, payload: { ...payload } })));

export const getSuppliesMapData: EmergencySuppliesGateway["getSuppliesMapData"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/map/data`, payload: { ...payload } })));

export const getSuppliesMapWarnings: EmergencySuppliesGateway["getSuppliesMapWarnings"] = async (payload) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/map/warnings`, payload: { ...payload } })));
