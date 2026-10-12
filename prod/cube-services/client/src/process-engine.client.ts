import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { ProcessEngineGateway } from "@ghcloud/cube-service-interface/process-engine";

import { useAuthRequest } from "./auth-request";

const BFF = "/gw-bff/process-engine";

export const getPermissionFormFlowGroupCount: ProcessEngineGateway["getPermissionFormFlowGroupCount"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/form-flow-groups/permission-count`, payload: { ...params } }).send();
    return resp.json();
  });

export const getFormFlowGroupCount: ProcessEngineGateway["getFormFlowGroupCount"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/form-flow-groups/count`, payload: { ...params } }).send();
    return resp.json();
  });

export const updateFormFlowGroup: ProcessEngineGateway["updateFormFlowGroup"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeCreateRequest({ url: `${BFF}/form-flow-groups`, payload: { ...params } }).send();
    return resp.json();
  });

export const deleteFormFlowGroup: ProcessEngineGateway["deleteFormFlowGroup"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({ url: `${BFF}/form-flow-groups/${id}` }).send();
    await resp.blob();
  });

export const getFormFlowPageList: ProcessEngineGateway["getFormFlowPageList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/form-flows`, payload: { ...params } }).send();
    return resp.json();
  });

export const updateFormFlowEnable: ProcessEngineGateway["updateFormFlowEnable"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeUpdateRequest({ url: `${BFF}/form-flows/enable`, payload: { ...params } }).send();
    return resp.json();
  });

export const deleteFormFlow: ProcessEngineGateway["deleteFormFlow"] = async (id) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({ url: `${BFF}/form-flows/${id}` }).send();
    await resp.blob();
  });

export const getFlowProcessPage: ProcessEngineGateway["getFlowProcessPage"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/processes`, payload: { ...params } }).send();
    return resp.json();
  });

export const getWorkOrderList: ProcessEngineGateway["getWorkOrderList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/processes/all`, payload: { ...params } }).send();
    return resp.json();
  });

export const exportWorkOrderList: ProcessEngineGateway["exportWorkOrderList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/processes/export`, payload: { ...params } }).send();
    return resp.blob();
  });

export const getWorkOrderStatisticsList: ProcessEngineGateway["getWorkOrderStatisticsList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeListRequest({ url: `${BFF}/statistics/business-types`, payload: { ...params } }).send();
    return resp.json();
  });

export const exportWorkOrderStatisticsList: ProcessEngineGateway["exportWorkOrderStatisticsList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/statistics/business-types/export`, payload: { ...params } }).send();
    return resp.blob();
  });

export const getFlowBusinessNodeNames: ProcessEngineGateway["getFlowBusinessNodeNames"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/business-node-names`, payload: { ...params } }).send();
    return resp.json();
  });

export const getFormFlowGroupList: ProcessEngineGateway["getFormFlowGroupList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/form-flow-groups`, payload: params ? { ...params } : undefined }).send();
    return resp.json();
  });

export const getWorkOrderBusinessTypeList: ProcessEngineGateway["getWorkOrderBusinessTypeList"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/business-types`, payload: params ? { ...params } : undefined }).send();
    return resp.json();
  });

export const getUserFlowNumber: ProcessEngineGateway["getUserFlowNumber"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeGETRequest({ url: `${BFF}/user-number`, payload: { ...params } }).send();
    return resp.json();
  });
