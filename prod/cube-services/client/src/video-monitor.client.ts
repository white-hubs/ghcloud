import {
  makeCreateRequest,
  makeCustomRequest,
  makeDELETERequest,
  makeGETRequest,
  makeListRequest,
  makeUpdateRequest,
} from "@ghcloud/cube-gateway";
import type {
  VideoMonitorAiInspectionGateway,
  VideoMonitorAuthGateway,
  VideoMonitorDeviceGateway,
  VideoMonitorGroupGateway,
} from "@ghcloud/cube-service-interface/video-monitor";

import { sendVideoMonitorText, sendVideoMonitorVoid } from "./video-monitor-request";

export const createCameraAuth: VideoMonitorAuthGateway["createAuthGroup"] = async (params) => {
  const resp = await makeCreateRequest({
    url: "/gw-bff/video-monitor/camera-auths",
    payload: { ...params },
  }).send();
  return resp.text();
};

export const updateCameraAuth: VideoMonitorAuthGateway["updateAuthGroup"] = async (id, params) => {
  const resp = await makeUpdateRequest({
    url: `/gw-bff/video-monitor/camera-auths/${id}`,
    payload: { ...params },
  }).send();
  await resp.blob();
};

export const deleteCameraAuth: VideoMonitorAuthGateway["deleteAuthGroup"] = async (id) => {
  const resp = await makeDELETERequest({
    url: `/gw-bff/video-monitor/camera-auths/${id}`,
  }).send();
  await resp.blob();
};

export const getCameraAuth: VideoMonitorAuthGateway["getAuthGroup"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/video-monitor/camera-auths/${id}`,
  }).send();
  return resp.json();
};

export const listAuthGroup: VideoMonitorAuthGateway["listAuthGroup"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/camera-auths`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listVideoMonitorGroup: VideoMonitorGroupGateway["listVideoMonitorGroup"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/device-groups`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listVideoMonitorDeviceOfRule: VideoMonitorDeviceGateway["listVideoMonitorDeviceOfRule"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/devices-of-rule`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listVideoMonitorDevice: VideoMonitorDeviceGateway["listVideoMonitorDevice"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `/gw-bff/video-monitor/devices`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const queryVideoMonitorDeviceByAreaOrGroupAndTag: VideoMonitorDeviceGateway["queryVideoMonitorDeviceByAreaOrGroupAndTag"] = async (
  params,
) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `/gw-bff/video-monitor/devices-by-area-or-group-and-tag`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listAiInspectionCameraOptions: VideoMonitorDeviceGateway["listAiInspectionCameraOptions"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `/gw-bff/video-monitor/ai-inspection/camera-options`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getAiInspectionCameraOptionsByIds: VideoMonitorDeviceGateway["getAiInspectionCameraOptionsByIds"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `/gw-bff/video-monitor/ai-inspection/camera-options/by-ids`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listAiInspectionAlgorithms: VideoMonitorAiInspectionGateway["listAiInspectionAlgorithms"] = async () => {
  const resp = await makeGETRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-algorithms`,
  }).send();
  return resp.json();
};

export const listAiInspectionPlans: VideoMonitorAiInspectionGateway["listAiInspectionPlans"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-plans`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getAiInspectionPlan: VideoMonitorAiInspectionGateway["getAiInspectionPlan"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}`,
  }).send();
  return resp.json();
};

export const pageAiInspectionPlanCameras: VideoMonitorAiInspectionGateway["pageAiInspectionPlanCameras"] = async (id, params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}/cameras`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listAiInspectionPlanActionRules: VideoMonitorAiInspectionGateway["listAiInspectionPlanActionRules"] = async (id, params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}/action-rules`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const createAiInspectionPlan: VideoMonitorAiInspectionGateway["createAiInspectionPlan"] = async (params) => {
  return sendVideoMonitorText(
    makeCreateRequest({
      url: `/gw-bff/video-monitor/camera-ai-inspection-plan`,
      payload: { ...params },
    }),
  );
};

export const patchAiInspectionPlan: VideoMonitorAiInspectionGateway["patchAiInspectionPlan"] = async (id, params) => {
  type CustomRequestConfig = Parameters<typeof makeCustomRequest>[0];
  await sendVideoMonitorVoid(
    makeCustomRequest({
      method: "PATCH" as CustomRequestConfig["method"],
      url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}`,
      payload: { ...params },
    }),
  );
};

export const updateAiInspectionPlanEnabled: VideoMonitorAiInspectionGateway["updateAiInspectionPlanEnabled"] = async (id, enabled) => {
  await sendVideoMonitorVoid(
    makeUpdateRequest({
      url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}/${enabled}`,
      payload: {},
    }),
  );
};

export const deleteAiInspectionPlan: VideoMonitorAiInspectionGateway["deleteAiInspectionPlan"] = async (id) => {
  await sendVideoMonitorVoid(
    makeDELETERequest({
      url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}`,
    }),
  );
};

export const runAiInspectionPlanOnce: VideoMonitorAiInspectionGateway["runAiInspectionPlanOnce"] = async (id) => {
  return sendVideoMonitorText(
    makeCreateRequest({
      url: `/gw-bff/video-monitor/camera-ai-inspection-plan/${id}/run-once`,
      payload: {},
    }),
  );
};

export const listAiInspectionTasks: VideoMonitorAiInspectionGateway["listAiInspectionTasks"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-tasks`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getAiInspectionTask: VideoMonitorAiInspectionGateway["getAiInspectionTask"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-task/${id}`,
  }).send();
  return resp.json();
};

export const listAiInspectionEvents: VideoMonitorAiInspectionGateway["listAiInspectionEvents"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-events`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getAiInspectionEvent: VideoMonitorAiInspectionGateway["getAiInspectionEvent"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-event/${id}`,
  }).send();
  return resp.json();
};

export const ignoreAiInspectionEvent: VideoMonitorAiInspectionGateway["ignoreAiInspectionEvent"] = async (id, params) => {
  const resp = await makeUpdateRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-event/${id}/ignore`,
    payload: { ...params },
  }).send();
  await resp.blob();
};

export const generateAiInspectionEventAction: VideoMonitorAiInspectionGateway["generateAiInspectionEventAction"] = async (id, params) => {
  const resp = await makeCreateRequest({
    url: `/gw-bff/video-monitor/camera-ai-inspection-event/${id}/generate-action`,
    payload: { ...params },
  }).send();
  await resp.blob();
};

export const listAiInspectionEmergencyRules: VideoMonitorAiInspectionGateway["listAiInspectionEmergencyRules"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/ai-inspection/emergency-rules`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const listAiInspectionWorkOrderTemplates: VideoMonitorAiInspectionGateway["listAiInspectionWorkOrderTemplates"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/video-monitor/ai-inspection/work-order-templates`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getAiInspectionWorkOrderTemplate: VideoMonitorAiInspectionGateway["getAiInspectionWorkOrderTemplate"] = async (id) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/video-monitor/ai-inspection/work-order-template/${id}`,
  }).send();
  return resp.json();
};
