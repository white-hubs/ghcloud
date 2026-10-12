import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { EmergencyDispatchGateway } from "@ghcloud/cube-service-interface/emergency-dispatch";

import { useAuthRequest } from "./auth-request";

const BFF = "/gw-bff/emergency-dispatch";

export const pageResourceRefs: EmergencyDispatchGateway["pageResourceRefs"] = async (query) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/resource-refs/page`,
      payload: { ...query },
    }).send();
    return resp.json();
  });

export const listResourceRefs: EmergencyDispatchGateway["listResourceRefs"] = async (query) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({
      url: `${BFF}/resource-refs/resources`,
      payload: { ...query },
    }).send();
    return resp.json();
  });

export const createResourceRef: EmergencyDispatchGateway["createResourceRef"] = async (payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({
      url: `${BFF}/resource-refs`,
      payload: payload.map((item) => ({ ...item })),
    }).send();
    await resp.blob();
  });

export const deleteResourceRef: EmergencyDispatchGateway["deleteResourceRef"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({
      url: `${BFF}/resource-refs/${id}`,
      payload: {},
    }).send();
    await resp.blob();
  });

export const getResourceRefStatistics: EmergencyDispatchGateway["getResourceRefStatistics"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/resource-refs/statistics`,
      payload: {},
    }).send();
    return resp.json();
  });

export const getAreaTree: EmergencyDispatchGateway["getAreaTree"] = async () =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/areas/tree`,
      payload: {},
    }).send();
    return resp.json();
  });

export const pageResourceCandidates: EmergencyDispatchGateway["pageResourceCandidates"] = async (query) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/resource-candidates/page`,
      payload: { ...query },
    }).send();
    return resp.json();
  });

export const createAreaPlaneMap: EmergencyDispatchGateway["createAreaPlaneMap"] = async (payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({
      url: `${BFF}/area-plane-maps`,
      payload: { ...payload },
    }).send();
    return resp.json();
  });

export const updateAreaPlaneMap: EmergencyDispatchGateway["updateAreaPlaneMap"] = async (id, payload) =>
  useAuthRequest(async () => {
    const resp = await makeUpdateRequest({
      url: `${BFF}/area-plane-maps/${id}`,
      payload: { ...payload },
    }).send();
    return resp.json();
  });

export const deleteAreaPlaneMap: EmergencyDispatchGateway["deleteAreaPlaneMap"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({
      url: `${BFF}/area-plane-maps/${id}`,
      payload: {},
    }).send();
    await resp.blob();
  });

export const listAreaPlaneMapsByAreaId: EmergencyDispatchGateway["listAreaPlaneMapsByAreaId"] = async (areaId) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({
      url: `${BFF}/area-plane-maps/area/${areaId}`,
      payload: {},
    }).send();
    return resp.json();
  });
