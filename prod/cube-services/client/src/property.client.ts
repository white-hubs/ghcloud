import { makeCreateRequest, makeDELETERequest, makeGETRequest } from "@ghcloud/cube-gateway";
import type { PropertyGateway } from "@ghcloud/cube-service-interface/property";

const BFF = "/api/property";

const readJsonOrVoid = async (resp: { json: () => Promise<unknown>; text: () => Promise<string> }): Promise<unknown> => {
  const text = await resp.text();
  if (!text.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

export const listPropertyClassifies: PropertyGateway["listPropertyClassifies"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/classify/getAssemblyClassifyPage`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listBoundProperties: PropertyGateway["listBoundProperties"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/property/bim/config/page`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listUnboundProperties: PropertyGateway["listUnboundProperties"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/property/detailed/getPropertyDetailedPage`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const bindVisualProperties: PropertyGateway["bindVisualProperties"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/property/bim/config/insert`,
    payload: { ...params },
  }).send();
  return readJsonOrVoid(resp);
};

export const unbindVisualProperties: PropertyGateway["unbindVisualProperties"] = async (params) => {
  const resp = await makeDELETERequest({
    url: `${BFF}/property/bim/config/delete`,
    payload: { ...params },
  }).send();
  return readJsonOrVoid(resp);
};

export const listBoundRiskSources: PropertyGateway["listBoundRiskSources"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/risk/source/bim/config/page`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listUnboundRiskSources: PropertyGateway["listUnboundRiskSources"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/risk/source/ledgerByBimSceneType/page`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const bindVisualRiskSources: PropertyGateway["bindVisualRiskSources"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/risk/source/bim/config/insert`,
    payload: { ...params },
  }).send();
  return readJsonOrVoid(resp);
};

export const unbindVisualRiskSources: PropertyGateway["unbindVisualRiskSources"] = async (params) => {
  const resp = await makeDELETERequest({
    url: `${BFF}/risk/source/bim/config/delete`,
    payload: { ...params },
  }).send();
  return readJsonOrVoid(resp);
};
