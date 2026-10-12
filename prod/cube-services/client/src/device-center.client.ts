import { makeCreateRequest, makeCustomRequest } from "@ghcloud/cube-gateway";
import type { DeviceCenterGateway } from "@ghcloud/cube-service-interface/device-center";

const BFF = "/api/device-center";

interface UnknownResponse {
  status: number;
  text: () => Promise<string>;
}

const parseUnknownResponse = async (resp: UnknownResponse): Promise<unknown> => {
  const text = await resp.text();
  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(text || `Request failed with status ${resp.status}`);
  }
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const listVisualBoundDevices: DeviceCenterGateway["listVisualBoundDevices"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `${BFF}/device/instance/page`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const bindVisualDevices: DeviceCenterGateway["bindVisualDevices"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/device-scene-config`,
    payload: { ...params },
  }).send();
  return parseUnknownResponse(resp);
};

export const unbindVisualDevices: DeviceCenterGateway["unbindVisualDevices"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/device-scene-config/${encodeURIComponent(params.sceneType)}/delete/devices`,
    payload: { businessIds: params.businessIds },
  }).send();
  return parseUnknownResponse(resp);
};

export const countAreaEmptyDevices: DeviceCenterGateway["countAreaEmptyDevices"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `${BFF}/device/area-empty/device-total`,
    payload: { ...params },
  }).send();
  return resp.json();
};
