import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { MdataGateway } from "@ghcloud/cube-service-interface/mdata";

const BFF = "/api/mdata";

export const listSceneTypeMenus: MdataGateway["listSceneTypeMenus"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/scene-type/page`,
    payload: { ...params },
  }).send();
  return resp.json();
};

type ResponseLike = {
  status: number;
  text: () => Promise<string>;
};

const responseErrorMessage = (payload: unknown, status: number): string => {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }
  if (payload && typeof payload === "object") {
    const error = payload as Record<string, unknown>;
    for (const key of ["message", "errorMessage", "details", "errorDetail"] as const) {
      const value = error[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }
  return `请求失败（${status}）`;
};

const readJsonOrVoid = async (resp: ResponseLike): Promise<unknown> => {
  const text = await resp.text();
  let payload: unknown;
  let parsed = false;
  if (text.trim()) {
    try {
      payload = JSON.parse(text) as unknown;
      parsed = true;
    } catch {
      payload = text;
    }
  }
  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(responseErrorMessage(payload, resp.status));
  }
  return parsed ? payload : undefined;
};

export const createSceneTypeMenu: MdataGateway["createSceneTypeMenu"] = async (params) => {
  const resp = await makeCreateRequest({ url: `${BFF}/scene-type`, payload: { ...params } }).send();
  return readJsonOrVoid(resp);
};

export const updateSceneTypeMenu: MdataGateway["updateSceneTypeMenu"] = async (params) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/scene-type/${params.id}`,
    payload: { ...params },
  }).send();
  // PUT 常返回空 body；resp.json() 会抛错导致前端误报失败
  return readJsonOrVoid(resp);
};

export const deleteSceneTypeMenu: MdataGateway["deleteSceneTypeMenu"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/scene-type/${id}` }).send();
  await resp.blob();
};

export const getAreaScenePanelConfig: MdataGateway["getAreaScenePanelConfig"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/area-scene-config/panel/${encodeURIComponent(params.areaId)}/${encodeURIComponent(params.sceneType)}`,
  }).send();
  return resp.json();
};

export const saveAreaScenePanelConfig: MdataGateway["saveAreaScenePanelConfig"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/area-scene-config/panel/disposable-save`,
    payload: { ...params },
  }).send();
  // 后端常返回空 body；resp.json() 会抛 Unexpected end of JSON input，保存实际已成功
  return readJsonOrVoid(resp);
};

export const listBusinessAreas: MdataGateway["listBusinessAreas"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/area/list` }).send();
  return resp.json();
};

export const listStallCategories: MdataGateway["listStallCategories"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/stall-category/list` }).send();
  return resp.json();
};

export const listBoundStalls: MdataGateway["listBoundStalls"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/stall-scene/stalls`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listUnboundStalls: MdataGateway["listUnboundStalls"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${BFF}/stall-scene/not-bind/stalls`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const bindVisualStalls: MdataGateway["bindVisualStalls"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/stall-scene-config`,
    payload: { ...params },
  }).send();
  return readJsonOrVoid(resp);
};

export const unbindVisualStalls: MdataGateway["unbindVisualStalls"] = async (params) => {
  const resp = await makeDELETERequest({
    url: `${BFF}/stall-scene-config/${encodeURIComponent(params.sceneType)}/delete/stalls`,
    payload: {
      businessIds: params.businessIds,
      ...(params.projectId ? { projectId: params.projectId } : {}),
    },
  }).send();
  return readJsonOrVoid(resp);
};
