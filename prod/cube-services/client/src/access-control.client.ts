import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, type CubeRequest } from "@ghcloud/cube-gateway";
import type { AccessControlGateway } from "@ghcloud/cube-service-interface/access-control";

import { useAuthRequest } from "./auth-request";

const BFF = "/gw-bff/access-control";

const json = async <T>(request: CubeRequest): Promise<T> => {
  const resp = await request.send();
  return resp.json<T>();
};

export const getEnterpriseDirectory: AccessControlGateway["getEnterpriseDirectory"] = async (params) =>
  useAuthRequest(() => json(makeListRequest({ url: `${BFF}/enterprise-directory`, payload: { ...params } })));

export const getDoorRanking: AccessControlGateway["getDoorRanking"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/door-ranking`, payload: { ...params } })));

export const getDoorEvents: AccessControlGateway["getDoorEvents"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/door-events`, payload: { ...params } })));

export const passedTodayNum: AccessControlGateway["passedTodayNum"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/passed-today-num`, payload: { ...params } })));

export const getDoorTend: AccessControlGateway["getDoorTend"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/door-tend`, payload: { ...params } })));

export const generDeviceIsWord: AccessControlGateway["generDeviceIsWord"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/security-lock/is-need`, payload: { ...params } })));

export const controlDoorverify: AccessControlGateway["controlDoorverify"] = async (params) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/security-lock/verify`, payload: { ...params } })));

export const generDevice: AccessControlGateway["generDevice"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/devices`, payload: { ...params } })));

export const getDoorType: AccessControlGateway["getDoorType"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/door-types`, payload: { ...params } })));

export const addDoorDevices: AccessControlGateway["addDoorDevices"] = async (params) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/door-devices`, payload: { ...params } })));

export const getDoorDevicePage: AccessControlGateway["getDoorDevicePage"] = async (params) =>
  useAuthRequest(() => json(makeListRequest({ url: `${BFF}/door-device-page`, payload: { ...params } })));

export const removeDoorDevice: AccessControlGateway["removeDoorDevice"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({ url: `${BFF}/door-device`, payload: { ...params } }).send();
    await resp.blob();
  });

export const removeDoorDeviceBatch: AccessControlGateway["removeDoorDeviceBatch"] = async (params) =>
  useAuthRequest(async () => {
    const resp = await makeDELETERequest({ url: `${BFF}/door-devices`, payload: { ...params } }).send();
    await resp.blob();
  });

export const controlDoor: AccessControlGateway["controlDoor"] = async (params) =>
  useAuthRequest(() => json(makeCreateRequest({ url: `${BFF}/control-door`, payload: { ...params } })));

export const getDoorEventRecord: AccessControlGateway["getDoorEventRecord"] = async (params) =>
  useAuthRequest(() => json(makeListRequest({ url: `${BFF}/door-event-record`, payload: { ...params } })));

export const getToDayEventTrend: AccessControlGateway["getToDayEventTrend"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/today-event-trend`, payload: { ...params } })));

export const getAbnormalEvent: AccessControlGateway["getAbnormalEvent"] = async (params) =>
  useAuthRequest(() => json(makeListRequest({ url: `${BFF}/abnormal-event`, payload: { ...params } })));

export const inspectgetStatus: AccessControlGateway["inspectgetStatus"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/door-status`, payload: { ...params } })));

export const getDeviceProduct: AccessControlGateway["getDeviceProduct"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/device-products`, payload: { ...params } })));

export const getDeviceList: AccessControlGateway["getDeviceList"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/device-list`, payload: { ...params } })));

export const getProductAll: AccessControlGateway["getProductAll"] = async (params) =>
  useAuthRequest(() => json(makeGETRequest({ url: `${BFF}/products`, payload: { ...params } })));
