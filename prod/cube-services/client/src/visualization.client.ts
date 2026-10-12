import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { VisualizationGateway } from "@ghcloud/cube-service-interface/visualization";

const BFF = "/api/visualization";

export const listVisualProjects: VisualizationGateway["listVisualProjects"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/project/queryProjectAll` }).send();
  return resp.json();
};

export const createVisualProject: VisualizationGateway["createVisualProject"] = async (params) => {
  const resp = await makeCreateRequest({ url: `${BFF}/project/insert`, payload: { ...params } }).send();
  return resp.json();
};

export const updateVisualProject: VisualizationGateway["updateVisualProject"] = async (params) => {
  const resp = await makeUpdateRequest({ url: `${BFF}/project/update`, payload: { ...params } }).send();
  return resp.json();
};

export const deleteVisualProject: VisualizationGateway["deleteVisualProject"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/project/${id}` }).send();
  await resp.blob();
};

export const copyVisualProject: VisualizationGateway["copyVisualProject"] = async (id) => {
  const resp = await makeCreateRequest({ url: `${BFF}/project/copy/${id}`, payload: {} }).send();
  await resp.blob();
};

export const getVisualModelConfiguration: VisualizationGateway["getVisualModelConfiguration"] = async (projectId) => {
  const resp = await makeGETRequest({
    url: `${BFF}/model-configuration`,
    payload: { projectId },
  }).send();
  return resp.json();
};

export const saveVisualModelConfiguration: VisualizationGateway["saveVisualModelConfiguration"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/add-model-configuration`,
    payload: { ...params },
  }).send();
  // The legacy save endpoint may return an empty body after a successful write.
  // Consuming it as JSON turns that successful request into a client-side parse error.
  await resp.blob();
};
