import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { WorkPermitGateway } from "@ghcloud/cube-service-interface/work-permit";

import { useAuthRequest } from "./auth-request";

const BFF = "/gw-bff/work-permit";

export const listWorkPermitTypes: WorkPermitGateway["listWorkPermitTypes"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/work-permit-types`, payload: { ...params } }).send();
    return resp.json();
  });

export const getWorkPermitTypeDetail: WorkPermitGateway["getWorkPermitTypeDetail"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/work-permit-types/${id}` }).send();
    return resp.json();
  });

export const createWorkPermitType: WorkPermitGateway["createWorkPermitType"] = async (payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/work-permit-types`, payload: { ...payload } }).send();
    return resp.json();
  });

export const updateWorkPermitType: WorkPermitGateway["updateWorkPermitType"] = async (id, payload) =>
  useAuthRequest(async () => {
    const resp = await makeUpdateRequest({ url: `${BFF}/work-permit-types/${id}`, payload: { ...payload } }).send();
    await resp.blob();
  });

export const deleteWorkPermitType: WorkPermitGateway["deleteWorkPermitType"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({ url: `${BFF}/work-permit-types/${id}` }).send();
    await resp.blob();
  });

export const listWorkPermitLevels: WorkPermitGateway["listWorkPermitLevels"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/work-permit-types/levels`, payload: { ...params } }).send();
    return resp.json();
  });

export const exportWorkPermitTypes: WorkPermitGateway["exportWorkPermitTypes"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/work-permit-types/export`, payload: { ...params } }).send();
    return resp.blob();
  });

export const recognizeWorkPermitAssociatedItemByAi: WorkPermitGateway["recognizeWorkPermitAssociatedItemByAi"] = async (payload) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/associated-items/ai-recognition`, payload: { ...payload } }).send();
    return resp.json();
  });
