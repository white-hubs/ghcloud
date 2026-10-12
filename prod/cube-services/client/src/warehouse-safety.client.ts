import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { Pagination } from "@ghcloud/cube-service-interface/base";
import type { WarehouseSafetyGateway } from "@ghcloud/cube-service-interface/warehouse-safety";
import type {
  WarehouseSafetyAreaTreeNode,
  WarehouseSafetyDeviceOption,
  WarehouseSafetyEvent,
  WarehouseSafetyForklift,
  WarehouseSafetyForkliftStatistics,
  WarehouseSafetyShelf,
  WarehouseSafetyShelfStatistics,
  WarehouseSafetyWarehouse,
  WarehouseSafetyWarehouseStatistics,
} from "@ghcloud/cube-service-interface/warehouse-safety";

import { useAuthRequest } from "./auth-request";

const API = "/gw-bff/warehouse-safety";

async function json<T>(request: { send: () => Promise<{ json: () => Promise<T> }> }): Promise<T> {
  const resp = await request.send();
  return await resp.json();
}

async function empty(request: { send: () => Promise<unknown> }): Promise<void> {
  await request.send();
}

export const pageWarehouses: WarehouseSafetyGateway["pageWarehouses"] = async (params) => {
  return useAuthRequest(() =>
    json<Pagination<WarehouseSafetyWarehouse>>(makeListRequest({ url: `${API}/warehouses`, payload: { ...params } })),
  );
};

export const getWarehouseStatistics: WarehouseSafetyGateway["getWarehouseStatistics"] = async () => {
  return useAuthRequest(() => json<WarehouseSafetyWarehouseStatistics>(makeGETRequest({ url: `${API}/statistics/warehouses` })));
};

export const getWarehouse: WarehouseSafetyGateway["getWarehouse"] = async (id) => {
  return useAuthRequest(() => json<WarehouseSafetyWarehouse>(makeGETRequest({ url: `${API}/warehouses/${id}` })));
};

export const createWarehouse: WarehouseSafetyGateway["createWarehouse"] = async (payload) => {
  return useAuthRequest(() => json<WarehouseSafetyWarehouse>(makeCreateRequest({ url: `${API}/warehouses`, payload: { ...payload } })));
};

export const updateWarehouse: WarehouseSafetyGateway["updateWarehouse"] = async (id, payload) => {
  return useAuthRequest(() =>
    json<WarehouseSafetyWarehouse>(makeUpdateRequest({ url: `${API}/warehouses/${id}`, payload: { ...payload } })),
  );
};

export const deleteWarehouse: WarehouseSafetyGateway["deleteWarehouse"] = async (id) => {
  return useAuthRequest(() => empty(makeDELETERequest({ url: `${API}/warehouses/${id}` })));
};

export const pageShelves: WarehouseSafetyGateway["pageShelves"] = async (params) => {
  return useAuthRequest(() => json<Pagination<WarehouseSafetyShelf>>(makeListRequest({ url: `${API}/shelves`, payload: { ...params } })));
};

export const getShelfStatistics: WarehouseSafetyGateway["getShelfStatistics"] = async () => {
  return useAuthRequest(() => json<WarehouseSafetyShelfStatistics>(makeGETRequest({ url: `${API}/statistics/shelves` })));
};

export const getShelf: WarehouseSafetyGateway["getShelf"] = async (id) => {
  return useAuthRequest(() => json<WarehouseSafetyShelf>(makeGETRequest({ url: `${API}/shelves/${id}` })));
};

export const createShelf: WarehouseSafetyGateway["createShelf"] = async (payload) => {
  return useAuthRequest(() => json<WarehouseSafetyShelf>(makeCreateRequest({ url: `${API}/shelves`, payload: { ...payload } })));
};

export const updateShelf: WarehouseSafetyGateway["updateShelf"] = async (id, payload) => {
  return useAuthRequest(() => json<WarehouseSafetyShelf>(makeUpdateRequest({ url: `${API}/shelves/${id}`, payload: { ...payload } })));
};

export const deleteShelf: WarehouseSafetyGateway["deleteShelf"] = async (id) => {
  return useAuthRequest(() => empty(makeDELETERequest({ url: `${API}/shelves/${id}` })));
};

export const pageForklifts: WarehouseSafetyGateway["pageForklifts"] = async (params) => {
  return useAuthRequest(() =>
    json<Pagination<WarehouseSafetyForklift>>(makeListRequest({ url: `${API}/forklifts`, payload: { ...params } })),
  );
};

export const getForkliftStatistics: WarehouseSafetyGateway["getForkliftStatistics"] = async () => {
  return useAuthRequest(() => json<WarehouseSafetyForkliftStatistics>(makeGETRequest({ url: `${API}/statistics/forklifts` })));
};

export const getForklift: WarehouseSafetyGateway["getForklift"] = async (id) => {
  return useAuthRequest(() => json<WarehouseSafetyForklift>(makeGETRequest({ url: `${API}/forklifts/${id}` })));
};

export const createForklift: WarehouseSafetyGateway["createForklift"] = async (payload) => {
  return useAuthRequest(() => json<WarehouseSafetyForklift>(makeCreateRequest({ url: `${API}/forklifts`, payload: { ...payload } })));
};

export const updateForklift: WarehouseSafetyGateway["updateForklift"] = async (id, payload) => {
  return useAuthRequest(() => json<WarehouseSafetyForklift>(makeUpdateRequest({ url: `${API}/forklifts/${id}`, payload: { ...payload } })));
};

export const deleteForklift: WarehouseSafetyGateway["deleteForklift"] = async (id) => {
  return useAuthRequest(() => empty(makeDELETERequest({ url: `${API}/forklifts/${id}` })));
};

export const pageEvents: WarehouseSafetyGateway["pageEvents"] = async (params) => {
  return useAuthRequest(() => json<Pagination<WarehouseSafetyEvent>>(makeListRequest({ url: `${API}/events`, payload: { ...params } })));
};

export const getEvent: WarehouseSafetyGateway["getEvent"] = async (id) => {
  return useAuthRequest(() => json<WarehouseSafetyEvent>(makeGETRequest({ url: `${API}/events/${id}` })));
};

export const listEventDevices: WarehouseSafetyGateway["listEventDevices"] = async (id) => {
  return useAuthRequest(() => json<WarehouseSafetyDeviceOption[]>(makeGETRequest({ url: `${API}/events/${id}/devices` })));
};

export const pageDeviceOptions: WarehouseSafetyGateway["pageDeviceOptions"] = async (params) => {
  return useAuthRequest(() =>
    json<Pagination<WarehouseSafetyDeviceOption>>(makeListRequest({ url: `${API}/devices`, payload: { ...params } })),
  );
};

export const getAreaTree: WarehouseSafetyGateway["getAreaTree"] = async () => {
  return useAuthRequest(() => json<WarehouseSafetyAreaTreeNode[]>(makeGETRequest({ url: `${API}/areas/tree` })));
};
